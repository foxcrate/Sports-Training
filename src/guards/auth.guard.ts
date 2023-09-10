import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';
import { BadRequestException } from 'src/exceptions/badRequest.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new BadRequestException('NO_BEARER_TOKEN');
    }

    let payload = this.authService.verifyToken(token);
    if (payload === false) {
      throw new BadRequestException('JWT_ERROR');
    }

    //There are two types of token normal or refresh
    if (payload.tokenType !== 'normal') {
      throw new BadRequestException('WRONG_JWT_ERROR');
    }

    request['authType'] = payload.authType;
    request['id'] = payload.id;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
