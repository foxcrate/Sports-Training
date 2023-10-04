import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { NewBadRequestException } from 'src/exceptions/new-bad-request.exception';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { GlobalService } from 'src/global/global.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
    private globalService: GlobalService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      // throw new NewBadRequestException('UNAUTHENTICATED');
      throw new UnauthorizedException(
        this.globalService.getError('en', 'NO_BEARER_TOKEN'),
      );
    }

    let payload = this.verifyToken(token);
    if (payload === false) {
      // throw new NewBadRequestException('UNAUTHENTICATED');
      throw new UnauthorizedException(
        this.globalService.getError('en', 'WRONG_CREDENTIALS'),
      );
    }

    //There are two types of token normal or refresh
    if (payload.tokenType !== 'normal') {
      // throw new NewBadRequestException('UNAUTHENTICATED');
      throw new UnauthorizedException(this.globalService.getError('en', 'JWT_ERROR'));
    }

    request['authType'] = payload.authType;
    request['id'] = payload.id;

    if (!(await this.userAvailable(request['id']))) {
      // throw new NewBadRequestException('UNAUTHENTICATED');
      throw new UnauthorizedException(
        this.globalService.getError('en', 'WRONG_CREDENTIALS'),
      );
    }

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

  private async userAvailable(userId) {
    let user = await this.prisma.$queryRaw`
      SELECT *
      FROM User
      WHERE id = ${userId}
      LIMIT 1
    `;
    return user[0];
  }
}
