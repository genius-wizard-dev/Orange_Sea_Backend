import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, account: any) {
    if (err || !account) {
      const errorMessage = err?.message || 'Invalid or expired JWT token';
      throw new UnauthorizedException(`Not Permission: ${errorMessage}`);
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
