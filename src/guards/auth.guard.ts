import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { BadRequestException } from 'src/exceptions/bad_request.exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new BadRequestException('NO_BEARER_TOKEN');
    }

    let payload = this.verifyToken(token);
    if (payload === false) {
      throw new BadRequestException('JWT_ERROR');
    }

    //There are two types of token normal or refresh
    if (payload.tokenType !== 'normal') {
      throw new BadRequestException('JWT_ERROR');
    }

    request['authType'] = payload.authType;
    request['id'] = payload.id;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private verifyToken(token) {
    try {
      const decoded = this.jwtService.verify(token, this.config.get('JWT_SECRET'));
      return decoded;
    } catch (error) {
      return false;
    }
  }
}
