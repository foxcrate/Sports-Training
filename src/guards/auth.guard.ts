import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { IAuthToken } from 'src/auth/interfaces/auth-token.interface';
import { UserRepository } from 'src/user/user.repository';
import { USER_TYPES_ENUM } from 'src/global/enums';
import { FIND_BY } from 'src/user/user-enums';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private userRepository: UserRepository,
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

    request['id'] = payload.id;
    request['authType'] = payload.authType;

    //Check if user exists
    let user = await this.userRepository.findBy(FIND_BY.ID, request['id']);
    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
    }

    let userMetaData = await this.userRepository.getUserMetaData(request['id']);

    // console.log({ userMetaData });

    // console.log({ userMetaData });
    let userRoles = [];
    if (userMetaData.playerProfileId) {
      userRoles.push('player');
    }
    if (userMetaData.trainerProfileId) {
      userRoles.push('trainer');
    }
    if (userMetaData.childrenNumber > 0) {
      userRoles.push('parent');
    }
    if (userMetaData.userType === USER_TYPES_ENUM.CHILD) {
      userRoles.push('child');
    }

    request['userRoles'] = userRoles;

    // request['playerProfileId'] = userMetaData.playerProfileId;
    // request['trainerProfileId'] = userMetaData.trainerProfileId;
    // request['childrenNumber'] = userMetaData.childrenNumber;

    if (!(await this.userAvailable(request['id']))) {
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
    let theUser = await this.userRepository.findBy(FIND_BY.ID, userId);
    if (!theUser) {
      return false;
    }
    return true;
  }
}
