import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Account } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { USER_DEVICE_INFO } from 'src/config/redis/key';
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
    this.accessExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '15m',
    );
    this.refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
  }

  private getConfigValue(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`${key} not properly configured`);
    }
    return value;
  }

  async generateAccessToken(
    account: Account,
    profileId: string,
  ): Promise<string> {
    try {
      const tokenId = crypto.randomBytes(16).toString('hex');
      const payload: JwtPayload = {
        sub: account.id,
        profileId,
        username: account.username,
        role: account.role,
        type: 'access',
        jti: tokenId,
      };

      return this.jwtService.sign(payload, {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn,
      });
    } catch (error) {
      this.logger.error(`Failed to generate access token: ${error.message}`);
      throw new Error('Could not generate access token');
    }
  }

  async validateAccessToken(
    token: string,
    deviceId: string,
  ): Promise<JwtPayload> {
    try {
      // Xác thực token và lấy payload
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.accessSecret,
      });

      // Kiểm tra type của token trước
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Kiểm tra token có bị blacklist không
      const isBlacklisted = await this.redisService.get(
        `blacklist:${payload.jti}`,
      );
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      const deviceData: DeviceData | null =
        await this.redisService.get<DeviceData>(
          USER_DEVICE_INFO(payload.profileId, deviceId),
        );
      if (!deviceData) {
        throw new UnauthorizedException('Device unknown');
      }

      // Kiểm tra user trong database
      const account = await this.prismaService.account.findUnique({
        where: { id: payload.sub },
      });
      if (!account) {
        throw new UnauthorizedException('User not found');
      }

      return payload;
    } catch (error) {
      this.logger.error(`Invalid access token: ${error.message}`);
      // Giữ nguyên message lỗi cụ thể thay vì ghi đè
      throw error instanceof UnauthorizedException
        ? error
        : new UnauthorizedException('Invalid access token');
    }
  }

  async revokeAccessToken(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.accessSecret,
      });
      const ttl = this.calculateRemainingTtl(payload.exp);

      if (ttl > 0 && payload.jti) {
        await this.redisService.set(`blacklist:${payload.jti}`, 'revoked', ttl);
        this.logger.debug(
          `Blacklisted access token ${payload.jti} for ${ttl}s`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to revoke access token: ${error.message}`);
    }
  }

  async generateRefreshToken({
    account,
    profileId,
    deviceId,
    ip,
    fcmToken,
    existingToken,
  }: {
    account: Account;
    profileId: string;
    deviceId: string;
    ip: string;
    fcmToken?: string;
    existingToken?: string;
  }): Promise<string> {
    try {
      const { expiresIn, ttl } = this.calculateTokenExpiration(existingToken);
      const tokenId = crypto.randomBytes(16).toString('hex');
      const payload: JwtPayload = {
        sub: account.id,
        username: account.username,
        profileId,
        role: account.role,
        type: 'refresh',
        jti: tokenId,
      };

      const token = this.jwtService.sign(payload, {
        secret: this.refreshSecret,
        expiresIn,
      });
      const key = USER_DEVICE_INFO(profileId, deviceId);

      await this.redisService.set(key, { ip, fcmToken, token }, ttl);

      return token;
    } catch (error) {
      this.logger.error(`Failed to generate refresh token: ${error.message}`);
      throw new UnauthorizedException('Failed to generate refresh token');
    }
  }

  private calculateTokenExpiration(existingToken?: string): {
    expiresIn: string;
    ttl: number;
  } {
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
      return ttl > 0
        ? { expiresIn: `${ttl}s`, ttl }
        : { expiresIn: `${DEFAULT_TTL}s`, ttl: DEFAULT_TTL };
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
    profileId: string,
    deviceId: string,
    data: { ip: string; fcmToken?: string; token: string },
    ttl: number,
  ): Promise<boolean> {
    const userKey = `user:${profileId}`;
    const currentDevice: DeviceData | null =
      await this.redisService.get<DeviceData>(
        USER_DEVICE_INFO(profileId, deviceId),
      );

    const deviceData: DeviceData = {
      ...currentDevice,
      ip: data.ip,
      fcmToken: data.fcmToken || '',
      token: data.token,
    };

    if (currentDevice) {
      await this.revokeRefreshToken(currentDevice.token, deviceId, data.ip);
    }

    await this.redisService.set(
      USER_DEVICE_INFO(profileId, deviceId),
      JSON.stringify(deviceData),
      ttl,
    );

    return true;
  }

  async verifyRefreshToken(token: string, deviceId: string): Promise<Account> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.refreshSecret,
      });

      if (payload.type !== 'refresh' || !payload.sub || !payload.profileId) {
        throw new UnauthorizedException('Invalid token format');
      }

      const deviceData: DeviceData | null =
        await this.redisService.get<DeviceData>(
          USER_DEVICE_INFO(payload.profileId, deviceId),
        );
      if (!deviceData) {
        throw new UnauthorizedException('Cannot get device data');
      }

      if (deviceData.token !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const account = await this.prismaService.account.findUnique({
        where: { id: payload.sub },
      });
      if (!account) {
        throw new UnauthorizedException('User not found');
      }

      return account;
    } catch (error) {
      this.logger.error(`Failed to verify refresh token: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(
    token: string,
    deviceId: string,
    ip: string,
  ): Promise<void> {
    try {
      const payload = this.jwtService.decode<JwtPayload>(token);
      if (!payload?.sub || !payload?.profileId)
        throw new Error('Invalid token: missing user ID or profile ID');
      const deviceData: DeviceData | null =
        await this.redisService.get<DeviceData>(
          USER_DEVICE_INFO(payload.profileId, deviceId),
        );

      if (!deviceData) {
        this.logger.warn(
          `Device ${deviceId} not found for user ${payload.profileId}`,
        );
        return;
      }

      if (deviceData.token !== token) {
        this.logger.warn(
          `Token mismatch for device ${deviceId}: stored token doesn't match provided token`,
        );
        return;
      }

      if (deviceData.ip !== ip) {
        this.logger.warn(
          `IP mismatch for device ${deviceId}: expected ${deviceData.ip}, received ${ip}`,
        );
        // Continue with revocation despite IP mismatch for security
      }

      await this.redisService.del(
        USER_DEVICE_INFO(payload.profileId, deviceId),
      );
      this.logger.debug(
        `Revoked refresh token for device ${deviceId} of user ${payload.profileId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to revoke refresh token: ${error.message}`);
      // Don't throw error to avoid blocking logout processes
    }
  }

  async removeDeviceById(profileId: string, deviceId: string): Promise<void> {
    try {
      const userKey = `user:${profileId}`;
      // Debug the incoming user ID to find potential mismatches
      this.logger.debug(
        `Removing device with profileId: ${profileId}, deviceId: ${deviceId}`,
      );

      // Kiểm tra xem thiết bị có tồn tại không trước khi xóa
      const deviceData = await this.redisService.get(
        USER_DEVICE_INFO(profileId, deviceId),
      );
      if (deviceData) {
        await this.redisService.del(USER_DEVICE_INFO(profileId, deviceId));
        this.logger.debug(
          `Removed device ${deviceId} for user ${profileId} from Redis`,
        );
      } else {
        this.logger.debug(`Device ${deviceId} not found for user ${profileId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to remove device: ${error.message}`);
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = this.jwtService.decode<JwtPayload>(token);
      this.logger.debug(
        `Decoded token - User ID: ${decoded?.sub}, Token type: ${decoded?.type}`,
      );
      return decoded;
    } catch (error) {
      this.logger.error(`Failed to decode token: ${error.message}`);
      return null;
    }
  }

  async getFCMToken(
    profileId: string,
    deviceId: string,
  ): Promise<string | null> {
    try {
      const deviceData: DeviceData | null =
        await this.redisService.get<DeviceData>(
          USER_DEVICE_INFO(profileId, deviceId),
        );

      if (!deviceData) {
        this.logger.debug(`Device ${deviceId} not found for user ${profileId}`);
        return null;
      }

      return deviceData.fcmToken || null;
    } catch (error) {
      this.logger.error(`Failed to get FCM token: ${error.message}`);
      return null;
    }
  }

  async getAllFCMTokens(profileId: string): Promise<string[]> {
    try {
      const userKey = `user:${profileId}`;
      this.logger.debug(`Đang lấy tất cả FCM tokens cho user ${profileId}`);
      // Lấy tất cả các thiết bị từ Redis bằng cách sử dụng các key riêng lẻ
      const deviceKeys = await this.redisService.keys(`${userKey}:*`);
      this.logger.debug(
        `Tìm thấy ${deviceKeys.length} thiết bị cho user ${profileId}`,
      );

      if (!deviceKeys || deviceKeys.length === 0) {
        this.logger.debug(`Không tìm thấy thiết bị nào cho user ${profileId}`);
        return [];
      }

      // Lấy dữ liệu cho mỗi thiết bị
      const allDevices = {};
      for (const key of deviceKeys) {
        const deviceId = key.split(':').pop();
        const deviceData = await this.redisService.get(key);
        if (deviceData && deviceId) {
          allDevices[deviceId] = deviceData;
        }
      }

      this.logger.debug(
        `Danh sách thiết bị: ${JSON.stringify(Object.keys(allDevices))}`,
      );

      const fcmTokens = Object.values(allDevices)
        .map((deviceDataStr) => {
          try {
            const deviceData: DeviceData = JSON.parse(deviceDataStr as string);
            this.logger.debug(
              `Đã parse dữ liệu thiết bị: ${JSON.stringify(deviceData)}`,
            );
            return deviceData.fcmToken;
          } catch (e) {
            this.logger.error(`Lỗi khi parse dữ liệu thiết bị: ${e.message}`);
            return null;
          }
        })
        .filter(
          (token): token is string => token !== null && token !== undefined,
        );

      this.logger.debug(
        `Đã tìm thấy ${fcmTokens.length} FCM tokens hợp lệ cho user ${profileId}`,
      );
      this.logger.debug(`Danh sách FCM tokens: ${JSON.stringify(fcmTokens)}`);

      return fcmTokens;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy tất cả FCM tokens: ${error.message}`);
      return [];
    }
  }
}
