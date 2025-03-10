import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, account: any) {
    if (err || !account) {
      throw new UnauthorizedException(
        'Not Permission: Invalid or expired JWT token',
      );
    }
    return account;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;

    const request = context.switchToHttp().getRequest();

    if (request.user) {
      request.account = request.user;
      delete request.user;
    }

    return result;
  }
}
