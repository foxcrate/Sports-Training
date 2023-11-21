import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
    // private userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.NO_BEARER_TOKEN`, { lang: I18nContext.current().lang }),
      );
    }

    let payload: IAuthToken = this.verifyToken(token);
    // let payload: IAuthToken = this.authService.verifyToken(token);
    if (payload.id === null) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
    }

    //There are two types of token normal or refresh
    if (payload.tokenType !== 'normal') {
      throw new UnauthorizedException(
        this.i18n.t(`errors.JWT_ERROR`, { lang: I18nContext.current().lang }),
      );
    }

    request['authType'] = payload.authType;
    request['id'] = payload.id;

    if (
      !(await this.userAvailable(request['id'])) &&
      !(await this.childAvailable(request['id']))
    ) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private verifyToken(token): IAuthToken {
    try {
      const decoded = this.jwtService.verify(token, this.config.get('JWT_SECRET'));
      return decoded;
    } catch (error) {
      // console.log('error in auth guard:', error);

      return {
        id: null,
        authType: null,
        tokenType: null,
      };
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

  private async childAvailable(childId) {
    let user = await this.prisma.$queryRaw`
      SELECT *
      FROM child
      WHERE id = ${childId}
      LIMIT 1
    `;
    return user[0];
  }
}
