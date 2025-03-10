import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  private readonly logger: Logger = new Logger(RolesGuard.name);
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const { account } = context.switchToHttp().getRequest();
    this.logger.debug(`Account request role: ${account.role}`);

    if (!account) {
      throw new UnauthorizedException(
        'Not Permission: No account found in request',
      );
    }

    const hasRequiredRole = requiredRoles.includes(account.role);
    if (!hasRequiredRole) {
      throw new UnauthorizedException(
        `Not Permission: Account role (${account.role}) does not have access. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
