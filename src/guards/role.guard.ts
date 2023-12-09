import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly i18n: I18nService,
  ) {}

  matchRoles(roles: string[], userRole: string) {
    return roles.some((role) => role === userRole);
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const authType = request['authType'];

    let accepted = this.matchRoles(roles, authType);
    // console.log('roles:', roles);
    // console.log('authType:', authType);

    if (!accepted) {
      throw new ForbiddenException(
        this.i18n.t(`errors.NOT_ALLOWED`, { lang: I18nContext.current().lang }),
      );
    }

    return true;
  }
}
