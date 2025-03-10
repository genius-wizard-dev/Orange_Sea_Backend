import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ProfileService } from '../profile/profile.service';
import { AuthService } from './auth.service';
import { JwtPayload } from './interfaces/jwt.interface';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
  ) {
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    try {
      // Lấy token từ header
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Xác thực token qua service
      await this.authService.validateAccessToken(token);

      const result = await this.profileService.findByUsername(payload.username);
      if (!result) {
        throw new UnauthorizedException(
          'Not Permission: User account no longer exists in the system',
        );
      }

      return {
        id: result.id,
        username: result.username,
        role: result.role,
        profileId: result.profile.id,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
