// src/auth/strategies/jwt-refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ProfileService } from 'src/profile/profile.service';
import { JwtPayload } from '../interfaces/jwt.interface';
import { TokenService } from '../token.service';
// import { AuthService } from './auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly tokenService: TokenService,
    private profileService: ProfileService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    try {
      const refreshToken = this.extractToken(req);

      const deviceId = req.headers['x-device-id'] as string;

      await this.tokenService.verifyRefreshToken(refreshToken, deviceId);
      const profile = await this.profileService.findByUsername(
        payload.username,
      );
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
