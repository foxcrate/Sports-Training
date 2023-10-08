import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { NewBadRequestException } from 'src/exceptions/new-bad-request.exception';
import { GlobalService } from 'src/global/global.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private globalService: GlobalService,
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
      // throw new NewBadRequestException('UNAUTHORIZED');
      throw new ForbiddenException(
        // this.globalService.getError('en', 'UNAUTHORIZED')
        this.i18n.t(`errors.UNAUTHORIZED`, { lang: I18nContext.current().lang }),
      );
    }

    return true;
  }
}
