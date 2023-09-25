import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { NewBadRequestException } from 'src/exceptions/new_bad_request.exception';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      // throw new BadRequestException('NO_BEARER_TOKEN');
      throw new NewBadRequestException('UNAUTHENTICATED');
    }

    let payload = this.verifyToken(token);
    if (payload === false) {
      // throw new BadRequestException('JWT_ERROR');
      throw new NewBadRequestException('UNAUTHENTICATED');
    }

    //There are two types of token normal or refresh
    if (payload.tokenType !== 'normal') {
      // throw new BadRequestException('JWT_ERROR');
      throw new NewBadRequestException('UNAUTHENTICATED');
    }

    request['authType'] = payload.authType;
    request['id'] = payload.id;

    if (!(await this.userAvailable(request['id']))) {
      // throw new BadRequestException('JWT_ERROR');
      throw new NewBadRequestException('UNAUTHENTICATED');
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
