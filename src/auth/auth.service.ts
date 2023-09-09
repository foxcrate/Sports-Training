import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SigninUserDto } from 'src/user/dtos/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from 'src/exceptions/badRequest.exception';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { ReturnUserSerializer } from 'src/user/serializers/returnUser.serializer';
import { hashPassword } from '../utils/password.util';
import { ConfigService } from '@nestjs/config';
import { verifyPassword } from '../utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async userSignin(signinData: SigninUserDto): Promise<any> {
    const user = await this.userService.findByMobile(signinData.mobileNumber);

    const validPassword = await verifyPassword(
      signinData.password,
      user.password,
    );

    if (!validPassword) {
      throw new BadRequestException('WRONG_PASSWORD');
    }

    let tokenPayload = {
      authType: 'user',
      id: user.id,
      tokenType: 'normal',
    };

    let refreshTokenPayload = {
      authType: 'user',
      id: user.id,
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

  async userSignup(signupData: SignupUserDto) {
    let repeatedAccount = await this.userService.findRepeated(
      signupData.email,
      signupData.mobileNumber,
    );

    if (!repeatedAccount) {
      signupData.password = await hashPassword(signupData.password);

      const newUser = await this.userService.create(signupData);
      return new ReturnUserSerializer().serialize(newUser);
    }
  }

  refreshToken(refreshToken) {
    let payload = this.verifyToken(refreshToken);
    if (payload === false) {
      throw new BadRequestException('JWT_ERROR');
    }
    if (payload.tokenType !== 'refresh') {
      throw new BadRequestException('WRONG_JWT_ERROR');
    }
    var tokenPayload = {
      authType: payload.authType,
      id: payload.id,
      tokenType: payload.tokenType,
    };

    return { token: this.jwtService.sign(tokenPayload, { expiresIn: '7d' }) };
  }

  verifyToken(token) {
    try {
      const decoded = this.jwtService.verify(
        token,
        this.config.get('JWT_SECRET'),
      );
      return decoded;
    } catch (error) {
      return false;
    }
  }
}
