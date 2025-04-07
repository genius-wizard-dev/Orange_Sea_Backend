import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err: any, account: any) {
    if (err || !account) {
      const errorMessage = err?.message || 'Invalid or expired refresh token';
      throw new UnauthorizedException(`Not Permission: ${errorMessage}`);
    }
    return account;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();

    if (request.user) {
      request.account = request.user;
    }

    return result;
  }
}
