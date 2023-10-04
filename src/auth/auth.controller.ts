import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UsePipes,
  Version,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoiValidation } from 'src/pipes/joi_validaiton.pipe';
import { SignupValidation } from 'src/user/validations/signup.validation';
import { UserSigninValidation } from 'src/user/validations/signin.validaiton';
import { ChildSigninValidation } from 'src/child/validaitons/signin.validation';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { SigninUserDto } from 'src/user/dtos/signin.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request as ExpressRequest } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { SigninChildDto } from 'src/child/dtos/signin.dto';
import { GoogleReturnDataSerializer } from './serializers/googleReturnData.serializer';
import { FacebookReturnDataSerializer } from './serializers/facebookReturnData.serializer';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Version('1')
  @Post('user/signup')
  @UsePipes(new JoiValidation(SignupValidation))
  async signup1(@Body() signupData: SignupUserDto) {
    return this.authService.userSignup(signupData);
  }

  @Version('1')
  @Post('/user/signin')
  @UsePipes(new JoiValidation(UserSigninValidation))
  async userSignin1(@Body() signinData: SigninUserDto) {
    // console.log('-- user signin route --');
    return this.authService.userSignin(signinData);
  }

  @Version('1')
  @Post('/child/signin')
  @UsePipes(new JoiValidation(ChildSigninValidation))
  async childSignin(@Body() signinData: SigninChildDto) {
    return this.authService.childSignin(signinData);
  }

  @Version('1')
  @Get('refresh_token')
  refreshToken(@Body('refreshToken') refreshToken, @Request() req: ExpressRequest) {
    return this.authService.refreshToken(refreshToken, req['authType']);
  }

  @Version('1')
  @Roles('child')
  @UseGuards(AuthGuard, RoleGuard)
  @Get('user/testJWT')
  test() {
    console.log('-- test jwt route --');
    return 'User Arrived';
  }

  @Get('google/redirect')
  @Version('1')
  async googleRedirect(@Query() queryParams) {
    // console.log('queryParams:', queryParams);

    let returnGoogleData = await this.authService.googleGetAccessTokenFromCode(
      queryParams.code,
    );
    // console.log('accessToken:', accessToken);

    let userData = await this.authService.getGoogleUserData(returnGoogleData);

    // console.log('userData:', userData);

    return GoogleReturnDataSerializer.serialize(userData);

    // return googleDataSerializer(userData);
  }

  @Get('facebook/redirect')
  @Version('1')
  async facebookRedirect(@Query() queryParams) {
    // console.log('queryParams:', queryParams);

    let accessToken = await this.authService.facebookGetAccessTokenFromCode(
      queryParams.code,
    );

    // console.log('accessToken:', accessToken);

    let userData = await this.authService.getFacebookUserData(accessToken);
    // console.log('userData:', userData);

    return FacebookReturnDataSerializer.serialize(userData);

    // return facebookDataSerializer(userData);
  }
}
