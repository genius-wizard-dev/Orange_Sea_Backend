import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      const errorMessage = err?.message || 'Invalid or expired refresh token';
      throw new UnauthorizedException(`Not Permission: ${errorMessage}`);
    }
    return user;
  }
}
