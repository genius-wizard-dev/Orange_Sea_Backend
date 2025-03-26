// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ProfileService } from 'src/profile/profile.service';

import { Request } from 'express';

import { JwtPayload } from '../interfaces/jwt.interface';
import { TokenService } from '../token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private tokenService: TokenService,
    private profileService: ProfileService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    try {
      const token = this.extractToken(req);
      const deviceId = req.headers['x-device-id'] as string;

      // Kiểm tra xem deviceId có tồn tại không
      if (!deviceId) {
        throw new UnauthorizedException('Device ID is missing');
      }

      // Kiểm tra tính hợp lệ của Access Token với thiết bị
      await this.tokenService.validateAccessToken(token, deviceId);

      // Kiểm tra user có tồn tại không
      const profile = await this.profileService.findByUsername(payload.username);
      if (!profile) {
        throw new UnauthorizedException('User does not exist');
      }

      return {
        id: profile.id,
        username: profile.username,
        role: profile.role,
        profileId: profile.profile.id,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }


  private extractToken(req: Request): string {
    const authHeader = req.headers['authorization'] || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token format');
    }
    return authHeader.split(' ')[1];
  }
}
