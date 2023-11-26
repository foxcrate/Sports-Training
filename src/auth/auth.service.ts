import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SigninUserDto } from 'src/user/dtos/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { ConfigService } from '@nestjs/config';
import { SigninChildDto } from 'src/child/dtos/signin.dto';
import { ChildService } from 'src/child/child.service';

import axios from 'axios';
import { AuthTokensDTO } from './dtos/auth-tokens.dto';
import { GlobalService } from 'src/global/global.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { AvailableRoles } from './dtos/availableRoles.dto';
import { IAuthToken } from './interfaces/auth-token.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { CompleteSignupUserDto } from 'src/user/dtos/complete-signup.dto';
import { UserModel } from 'src/user/user.model';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private userModel: UserModel,
    private prisma: PrismaService,
    private childService: ChildService,
    private jwtService: JwtService,
    private config: ConfigService,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
  ) {}

  async userSignup(signupData: SignupUserDto) {
    let repeatedAccount = await this.userService.findRepeated(
      signupData.email,
      signupData.mobileNumber,
    );

    if (!repeatedAccount) {
      signupData.password = await this.globalService.hashPassword(signupData.password);

      const newUser = await this.userService.create(signupData);

      return newUser;
    }
  }

  async createPassword(userId: string, password: string) {
    let hashedPassword = await this.globalService.hashPassword(password);
    let theUser = await this.userModel.getUserById(userId);

    await this.userModel.updatePassword(userId, hashedPassword);

    let updatedUser = await this.userModel.getUserById(theUser.id);

    return updatedUser;
  }

  async userCompleteSignup(userId: string, completeSignupData: CompleteSignupUserDto) {
    let repeatedAccount = await this.userService.findRepeatedEmail(
      completeSignupData.email,
    );

    if (!repeatedAccount) {
      const newUser = await this.userService.completeSignup(userId, completeSignupData);
      return newUser;
    }
  }

  async sendOtp(mobileNumber: string) {
    await this.userService.findRepeatedMobile(mobileNumber);

    this.saveOTP(mobileNumber, '1234');
    //send otp
    return 'OTP sent successfully';
  }

  async verifyOTP(data: VerifyOtpDto) {
    //account already saved
    await this.userService.findRepeatedMobile(data.mobileNumber);

    //throw error if not passed
    await this.checkSavedOTP(data.mobileNumber, data.otp);

    //return token to user
    return await this.signupUserAndReturnToken(data.mobileNumber);
  }

  private async saveOTP(mobileNumber: string, otp: string) {
    await this.prisma.$queryRaw`
    INSERT INTO OTP
    (
      mobileNumber,
      OTP,
      updatedAt
    )
    VALUES
    (
      ${mobileNumber},
      ${otp},
      ${new Date()}
    )`;
  }

  private async checkSavedOTP(mobileNumber: string, otp: string): Promise<any> {
    let obj = await this.prisma.$queryRaw`
      SELECT
      *
      FROM OTP
      WHERE
      mobileNumber = ${mobileNumber}
    `;

    if (!obj[0] || obj[0].otp != otp) {
      throw new NotFoundException(
        this.i18n.t(`errors.WRONG_OTP`, { lang: I18nContext.current().lang }),
      );
    }

    return true;
  }

  private async signupUserAndReturnToken(mobileNumber: string): Promise<any> {
    let createdUser = await this.userService.createByMobile(mobileNumber);
    return this.generateNormalAndRefreshJWTToken(AvailableRoles.User, createdUser.id);
  }

  async userSignin(signinData: SigninUserDto): Promise<AuthTokensDTO> {
    const user = await this.userService.findByMobile(signinData.mobileNumber);

    const validPassword = await this.globalService.verifyPassword(
      signinData.password,
      user.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
    }

    return this.generateNormalAndRefreshJWTToken(AvailableRoles.User, user.id);
  }

  async childSignin(signinData: SigninChildDto): Promise<AuthTokensDTO> {
    const child = await this.childService.findByMobile(signinData.mobileNumber);

    const validPassword = await this.globalService.verifyPassword(
      signinData.password,
      child.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
    }

    return this.generateNormalAndRefreshJWTToken(AvailableRoles.Child, child.id);
  }

  refreshToken(refreshToken: string) {
    let payload: IAuthToken = this.verifyRefreshToken(refreshToken);
    if (payload.id === null) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.WRONG_CREDENTIALS`, { lang: I18nContext.current().lang }),
      );
    }
    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException(
        this.i18n.t(`errors.JWT_ERROR`, { lang: I18nContext.current().lang }),
      );
    }

    let tokenPayload: IAuthToken = {
      authType: payload.authType,
      id: payload.id,
      tokenType: 'normal',
    };

    let refreshTokenPayload: IAuthToken = {
      authType: payload.authType,
      id: payload.id,
      tokenType: 'refresh',
    };

    return {
      token: this.jwtService.sign(tokenPayload, {
        expiresIn: '7d',
      }),
      refreshToken: this.jwtService.sign(refreshTokenPayload, {
        expiresIn: '30d',
      }),
    };
  }

  generateNormalAndRefreshJWTToken(authType: string, authId: number) {
    let tokenPayload = {
      authType: authType,
      id: authId,
      tokenType: 'normal',
    };

    let refreshTokenPayload = {
      authType: authType,
      id: authId,
      tokenType: 'refresh',
    };

    return {
      token: this.jwtService.sign(tokenPayload, {
        expiresIn: '7d',
      }),
      refreshToken: this.jwtService.sign(refreshTokenPayload, {
        expiresIn: '30d',
      }),
    };
  }

  verifyRefreshToken(token): IAuthToken {
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

  async googleGetAccessTokenFromCode(code) {
    const { data } = await axios({
      url: `https://oauth2.googleapis.com/token`,
      method: 'post',
      data: {
        client_id:
          '670804517627-aomfros7g713se328pnaid94leb3cm1k.apps.googleusercontent.com',
        client_secret: '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',
        redirect_uri: 'http://localhost:8000/api/v1/auth/google/redirect',
        grant_type: 'authorization_code',
        code,
      },
    });
    return data.access_token;
  }

  async getGoogleUserData(access_token) {
    try {
      const { data } = await axios({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        method: 'get',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return data;
    } catch (err) {
      console.log('error in getGoogleUserData() --', err);

      throw new BadRequestException(
        this.i18n.t(`errors.GOOGLE_TOKEN_ERROR`, { lang: I18nContext.current().lang }),
      );
    }
  }

  async facebookGetAccessTokenFromCode(code) {
    const { data } = await axios({
      url: 'https://graph.facebook.com/v17.0/oauth/access_token',
      method: 'get',
      params: {
        client_id: '1352719315675450',
        client_secret: 'f025998289763b57d545e8310ccd3ee4',
        redirect_uri:
          'https://2cee-41-129-14-82.ngrok-free.app/api/v1/auth/facebook/redirect',
        code,
      },
    });
    return data.access_token;
  }

  async getFacebookUserData(access_token) {
    try {
      const { data } = await axios({
        url: 'https://graph.facebook.com/me',
        method: 'get',
        params: {
          fields: [
            'id',
            'email',
            'first_name',
            'last_name',
            'picture',
            // 'birthday',
          ].join(','),
          access_token: access_token,
        },
      });
      return data;
    } catch (err) {
      console.log('error in getFacebookUserData() --', err);

      throw new BadRequestException(
        this.i18n.t(`errors.FACEBOOK_TOKEN_ERROR`, { lang: I18nContext.current().lang }),
      );
    }
  }
}
