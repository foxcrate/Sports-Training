import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BadRequestException } from 'src/exceptions/bad_request.exception';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

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
      throw new BadRequestException('UNAUTHORIZED');
    }

    return true;
  }
}
