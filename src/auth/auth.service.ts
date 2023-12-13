import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SigninUserDto } from 'src/user/dtos/signin.dto';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { ConfigService } from '@nestjs/config';

import axios from 'axios';
import { AuthTokensDTO } from './dtos/auth-tokens.dto';
import { GlobalService } from 'src/global/global.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { AvailableRoles } from './dtos/available-roles.dto';
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

  async createPassword(userId: number, password: string) {
    let hashedPassword = await this.globalService.hashPassword(password);
    let theUser = await this.userModel.getById(userId);

    await this.userModel.updatePassword(userId, hashedPassword);

    let updatedUser = await this.userModel.getById(theUser.id);

    return updatedUser;
  }

  async userCompleteSignup(userId: number, completeSignupData: CompleteSignupUserDto) {
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

    await this.saveOTP(mobileNumber, '1234');
    //send otp
    return 'OTP sent successfully';
  }

  async verifySignupOTP(data: VerifyOtpDto) {
    //account already saved
    await this.userService.findRepeatedMobile(data.mobileNumber);

    //throw error if not passed
    await this.checkSavedOTP(data.mobileNumber, data.otp);

    await this.deletePastOTP(data.mobileNumber);

    //return token to user
    return await this.signupUserAndReturnToken(data.mobileNumber);
  }

  async verifyChangeMobileOTP(data: VerifyOtpDto, userId: number) {
    //throw error if not passed
    await this.checkSavedOTP(data.mobileNumber, data.otp);

    await this.deletePastOTP(data.mobileNumber);

    //return token to user
    return await this.userModel.updateMobile(userId, data.mobileNumber);
  }

  private async saveOTP(mobileNumber: string, otp: string) {
    let foundedNumber = await this.prisma.$queryRaw`
      SELECT *
      FROM OTP
      WHERE mobileNumber = ${mobileNumber}
    `;

    if (foundedNumber[0]) {
      await this.prisma.$queryRaw`
      UPDATE OTP
      SET
      otp = ${otp}
      WHERE
      mobileNumber = ${mobileNumber}
    `;
    } else {
      await this.prisma.$queryRaw`
      INSERT INTO OTP
      (
        mobileNumber,
        OTP
      )
      VALUES
      (
        ${mobileNumber},
        ${otp}
      )`;
    }
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
      await this.deletePastOTP(mobileNumber);
      throw new NotFoundException(
        this.i18n.t(`errors.WRONG_OTP`, { lang: I18nContext.current().lang }),
      );
    }

    return true;
  }

  private async deletePastOTP(mobileNumber: string): Promise<any> {
    await this.prisma.$queryRaw`
      DELETE
      FROM OTP
      WHERE
      mobileNumber = ${mobileNumber}
    `;
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

  async childSignin(signinData: SigninUserDto): Promise<AuthTokensDTO> {
    const child = await this.userService.findByMobile(signinData.mobileNumber);

    if (!child.isActivated) {
      throw new UnauthorizedException(
        this.i18n.t(`errors.ACCOUNT_NOT_ACTIVATED`, { lang: I18nContext.current().lang }),
      );
    }

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

  async getAppleUserData(access_token) {
    try {
      const { header } = jwt.decode(access_token, {
        complete: true,
      });

      console.log({ header });

      const kid = header.kid;
      const publicKey = (await this.key(kid)).getPublicKey();

      const data = jwt.verify(access_token, publicKey);
      return data;
    } catch (err) {
      console.log('error in getAppleUserData() --', err);

      throw new BadRequestException(
        this.i18n.t(`errors.APPLE_TOKEN_ERROR`, { lang: I18nContext.current().lang }),
      );
    }
  }

  private async key(kid) {
    const client = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      timeout: 30000,
    });

    return await client.getSigningKey(kid);
  }
}
