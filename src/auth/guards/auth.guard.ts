import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      const errorMessage = err?.message || 'Invalid or expired JWT token';
      throw new UnauthorizedException(`Not Permission: ${errorMessage}`);
    }
    return user;
  }
}
