import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SigninUserDto } from 'src/user/dtos/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { NewBadRequestException } from 'src/exceptions/new_bad_request.exception';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { ReturnUserSerializer } from 'src/user/serializers/return_user.serializer';
import { PasswordUtility } from '../utils/password.util';
import { ConfigService } from '@nestjs/config';
import { SigninChildDto } from 'src/child/dtos/signin.dto';
import { ChildService } from 'src/child/child.service';

import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private childService: ChildService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async userSignup(signupData: SignupUserDto) {
    let repeatedAccount = await this.userService.findRepeated(
      signupData.email,
      signupData.mobileNumber,
    );

    if (!repeatedAccount) {
      signupData.password = await PasswordUtility.hashPassword(signupData.password);

      const newUser = await this.userService.create(signupData);
      return new ReturnUserSerializer().serialize(newUser);
    }
  }

  async userSignin(signinData: SigninUserDto): Promise<any> {
    const user = await this.userService.findByMobile(signinData.mobileNumber);

    const validPassword = await PasswordUtility.verifyPassword(
      signinData.password,
      user.password,
    );

    if (!validPassword) {
      throw new NewBadRequestException('WRONG_CREDENTIALS');
    }

    return this.generateNormalAndRefreshJWTToken('user', user.id);
  }

  async childSignin(signinData: SigninChildDto): Promise<any> {
    const child = await this.childService.findByMobile(signinData.mobileNumber);

    const validPassword = await PasswordUtility.verifyPassword(
      signinData.password,
      child.password,
    );

    if (!validPassword) {
      throw new NewBadRequestException('WRONG_CREDENTIALS');
    }

    return this.generateNormalAndRefreshJWTToken('child', child.id);
  }

  refreshToken(refreshToken: string, authType: string) {
    let payload = this.verifyToken(refreshToken);
    if (payload === false) {
      throw new NewBadRequestException('JWT_ERROR');
    }
    if (payload.tokenType !== 'refresh') {
      throw new NewBadRequestException('JWT_ERROR');
    }

    let tokenPayload = {
      authType: authType,
      id: payload.id,
      tokenType: 'normal',
    };

    let refreshTokenPayload = {
      authType: authType,
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

  verifyToken(token) {
    try {
      const decoded = this.jwtService.verify(token, this.config.get('JWT_SECRET'));
      return decoded;
    } catch (error) {
      return false;
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
    // console.log(data); // { access_token, expires_in, token_type, refresh_token }
    return data.access_token;
  }

  async getGoogleUserData(access_token) {
    const { data } = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    // console.log(data); // { id, email, given_name, family_name }
    return data;
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
    // console.log(data); // { access_token, token_type, expires_in }
    return data.access_token;
  }

  async getFacebookUserData(access_token) {
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
    // console.log(data); // { id, email, first_name, last_name }
    return data;
  }
}
