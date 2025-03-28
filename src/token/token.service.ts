import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Account } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { DeviceData, JwtPayload } from './interfaces/jwt.interface';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.getConfigValue('JWT_ACCESS_SECRET');
    this.refreshSecret = this.getConfigValue('JWT_REFRESH_SECRET');
    this.accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    this.refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  private getConfigValue(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`${key} not properly configured`);
    }
    return value;
  }

  async generateAccessToken(account: Account): Promise<string> {
    const tokenId = crypto.randomBytes(16).toString('hex');
    const payload: JwtPayload = {
      sub: account.id,
      username: account.username,
      role: account.role,
      type: 'access',
      jti: tokenId,
    };

    try {
      return this.jwtService.sign(payload, {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      });
    } catch (error) {
      this.logger.error(`Failed to generate access token: ${error.message}`);
      throw new UnauthorizedException('Could not generate access token');
    }
  }

  async validateAccessToken(token: string, deviceId: string): Promise<JwtPayload> {
    try {
      // Xác thực token và lấy payload
      const payload = this.jwtService.verify<JwtPayload>(token, { secret: this.accessSecret });

      // Kiểm tra type của token trước
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Kiểm tra token có bị blacklist không
      const isBlacklisted = await this.redisService.get(`blacklist:${payload.jti}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Kiểm tra device trong Redis
      const userKey = `user:${payload.sub}`;
      const deviceData: DeviceData | null = await this.redisService.hget<DeviceData>(userKey, deviceId);

      if (!deviceData) {
        throw new UnauthorizedException('Device unknown');
      }

      // Kiểm tra user trong database
      const account = await this.prismaService.account.findUnique({ where: { id: payload.sub } });
      if (!account) {
        throw new UnauthorizedException('User not found');
      }

      return payload;
    } catch (error) {
      this.logger.error(`Invalid access token: ${error.message}`);
      // Giữ nguyên message lỗi cụ thể thay vì ghi đè
      throw error instanceof UnauthorizedException ? error : new UnauthorizedException('Invalid access token');
    }
  }

  async revokeAccessToken(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, { secret: this.accessSecret });
      const ttl = this.calculateRemainingTtl(payload.exp);

      if (ttl > 0 && payload.jti) {
        await this.redisService.set(`blacklist:${payload.jti}`, 'revoked', ttl);
        this.logger.debug(`Blacklisted access token ${payload.jti} for ${ttl}s`);
      }
    } catch (error) {
      this.logger.error(`Failed to revoke access token: ${error.message}`);
    }
  }

  async generateRefreshToken({
    account,
    deviceId,
    ip,
    fcmToken,
    existingToken,
  }: {
    account: Account;
    deviceId: string;
    ip: string;
    fcmToken?: string;
    existingToken?: string;
  }): Promise<string | null> {
    const { expiresIn, ttl } = this.calculateTokenExpiration(existingToken);
    const tokenId = crypto.randomBytes(16).toString('hex');
    const payload: JwtPayload = {
      sub: account.id,
      username: account.username,
      role: account.role,
      type: 'refresh',
      jti: tokenId,
    };

    try {
      const token = this.jwtService.sign(payload, {
        secret: this.refreshSecret,
        expiresIn,
      });

      const updated = await this.updateDeviceInRedis(account.id, deviceId, { ip, fcmToken, token }, ttl);
      return updated ? token : null;
    } catch (error) {
      this.logger.error(`Failed to generate refresh token: ${error.message}`);
      throw new UnauthorizedException('Failed to generate refresh token');
    }
  }

  private calculateTokenExpiration(existingToken?: string): { expiresIn: string; ttl: number } {
    const DEFAULT_TTL = 7 * 24 * 60 * 60;

    if (!existingToken) {
      return { expiresIn: this.refreshExpiresIn, ttl: DEFAULT_TTL };
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(existingToken, {
        secret: this.refreshSecret,
        ignoreExpiration: true,
      });
      const ttl = this.calculateRemainingTtl(payload.exp);
      return ttl > 0 ? { expiresIn: `${ttl}s`, ttl } : { expiresIn: `${DEFAULT_TTL}s`, ttl: DEFAULT_TTL };
    } catch (error) {
      this.logger.warn(`Invalid existing token: ${error.message}`);
      return { expiresIn: `${DEFAULT_TTL}s`, ttl: DEFAULT_TTL };
    }
  }

  private calculateRemainingTtl(expiration?: number): number {
    if (!expiration) return 0;
    const currentTime = Math.floor(Date.now() / 1000);
    return expiration - currentTime;
  }

  private async updateDeviceInRedis(
    accountId: string,
    deviceId: string,
    data: { ip: string; fcmToken?: string; token: string },
    ttl: number,
  ): Promise<boolean> {
    const userKey = `user:${accountId}`;
    const currentDevice: DeviceData | null = await this.redisService.hget<DeviceData>(userKey, deviceId);

    const deviceData: DeviceData = {
      ...currentDevice,
      ip: data.ip,
      ...(data.fcmToken && { fcmToken: data.fcmToken }),
      lastLogin: new Date().toISOString(),
      refreshToken: data.token,
    };

    if (currentDevice) {
      await this.revokeRefreshToken(currentDevice.refreshToken, deviceId, data.ip);
    }

    await this.redisService.hset(userKey, deviceId, JSON.stringify(deviceData));
    if (ttl) await this.redisService.expire(userKey, ttl);

    return true;
  }

  async verifyRefreshToken(token: string, deviceId: string): Promise<Account> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, { secret: this.refreshSecret });

      if (payload.type !== 'refresh' || !payload.sub) {
        throw new UnauthorizedException('Invalid token format');
      }

      const userKey = `user:${payload.sub}`;
      // Lấy dữ liệu của field deviceId từ hash
      const deviceData: DeviceData | null = await this.redisService.hget<DeviceData>(userKey, deviceId);

      if (!deviceData || deviceData.refreshToken !== token) {
        throw new UnauthorizedException('Invalid or unknown refresh token');
      }

      const account = await this.prismaService.account.findUnique({ where: { id: payload.sub } });
      if (!account) {
        throw new UnauthorizedException('User not found');
      }

      return account;
    } catch (error) {
      this.logger.error(`Failed to verify refresh token: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(token: string, deviceId: string, ip: string): Promise<void> {
    try {
      const payload = this.jwtService.decode<JwtPayload>(token);
      if (!payload?.sub) throw new Error('Invalid token: missing user ID');

      const userKey = `user:${payload.sub}`;
      const deviceData: DeviceData | null = await this.redisService.hget<DeviceData>(userKey, deviceId);

      if (deviceData && deviceData.refreshToken === token && deviceData.ip === ip) {
        await this.redisService.hdel(userKey, deviceId);
        this.logger.debug(`Revoked refresh token for device ${deviceId} of user ${payload.sub}`);
      } else {
        throw new Error('Device mismatch or unknown');
      }
    } catch (error) {
      this.logger.error(`Failed to revoke refresh token: ${error.message}`);
      throw error;
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.decode<JwtPayload>(token);
    } catch (error) {
      this.logger.error(`Failed to decode token: ${error.message}`);
      return null;
    }
  }
}
