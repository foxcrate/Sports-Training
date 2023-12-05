import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Version,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { SignupValidation } from 'src/user/validations/signup.validation';
import { UserSigninValidation } from 'src/user/validations/signin.validaiton';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { SigninUserDto } from 'src/user/dtos/signin.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request as ExpressRequest } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { GoogleReturnDataSerializer } from './serializers/google-return-data.serializer';
import { FacebookReturnDataSerializer } from './serializers/facebook-return-data.serializer';
import { SendOTPValidation } from './validations/send-otp.validation';
import { VerifyOtpValidation } from './validations/verify-otp.validation';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { CreatePasswordDto } from './dtos/create-password.dto';
import { SendOTPDto } from './dtos/send-otp.validation';
import { CreatePasswordValidation } from './validations/create-password.validaiton';
import { CompleteSignupValidation } from 'src/user/validations/complete-signup.validation';
import { AccessTokenValidation } from './validations/access-token.validation';
import { AppleReturnDataSerializer } from './serializers/apple-return-data.serializer';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('user/signup')
  @Version('1')
  async signup1(@Body(new JoiValidation(SignupValidation)) signupData: SignupUserDto) {
    return this.authService.userSignup(signupData);
  }

  @Post('user/send-signup-otp')
  @Version('1')
  async sendOtp1(@Body(new JoiValidation(SendOTPValidation)) sendOTPData: SendOTPDto) {
    return this.authService.sendOtp(sendOTPData.mobileNumber);
  }

  @Post('user/create-password')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async createPassword1(
    @Body(new JoiValidation(CreatePasswordValidation))
    createPasswordData: CreatePasswordDto,
    @Request() req: ExpressRequest,
  ) {
    return this.authService.createPassword(req['id'], createPasswordData.password);
  }

  @Post('user/verify-signup-otp')
  @Version('1')
  async verifyOtp1(
    @Body(new JoiValidation(VerifyOtpValidation)) verifyOtpData: VerifyOtpDto,
  ) {
    return this.authService.verifyOTP(verifyOtpData);
  }

  @Post('user/complete-signup')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async completeSignup1(
    @Body(new JoiValidation(CompleteSignupValidation)) completeSignupData: SignupUserDto,
    @Request() req: ExpressRequest,
  ) {
    return this.authService.userCompleteSignup(req['id'], completeSignupData);
  }

  @Post('/user/signin')
  @Version('1')
  async userSignin1(
    @Body(new JoiValidation(UserSigninValidation)) signinData: SigninUserDto,
  ) {
    return this.authService.userSignin(signinData);
  }

  @Post('/child/signin')
  @Version('1')
  async childSignin(
    @Body(new JoiValidation(UserSigninValidation)) signinData: SigninUserDto,
  ) {
    return this.authService.childSignin(signinData);
  }

  @Get('refresh-token')
  @Version('1')
  refreshToken(@Body('refreshToken') refreshToken, @Request() req: ExpressRequest) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('google-data')
  @Version('1')
  async googleRedirect(@Body(new JoiValidation(AccessTokenValidation)) reqBody) {
    let userData = await this.authService.getGoogleUserData(reqBody.accessToken);

    return GoogleReturnDataSerializer.serialize(userData);
  }

  // @Get('google/redirect')
  // @Version('1')
  // async googleRedirect(@Query() queryParams) {
  //   let returnGoogleData = await this.authService.googleGetAccessTokenFromCode(
  //     queryParams.code,
  //   );

  //   let userData = await this.authService.getGoogleUserData(returnGoogleData);

  //   return GoogleReturnDataSerializer.serialize(userData);
  // }

  @Post('facebook-data')
  @Version('1')
  async facebookRedirect(@Body(new JoiValidation(AccessTokenValidation)) reqBody) {
    let userData = await this.authService.getFacebookUserData(reqBody.accessToken);

    return FacebookReturnDataSerializer.serialize(userData);
  }

  // @Get('facebook/redirect')
  // @Version('1')
  // async facebookRedirect(@Query() queryParams) {
  //   let accessToken = await this.authService.facebookGetAccessTokenFromCode(
  //     queryParams.code,
  //   );

  //   let userData = await this.authService.getFacebookUserData(accessToken);

  //   return FacebookReturnDataSerializer.serialize(userData);
  // }

  @Post('apple-data')
  @Version('1')
  async appleRedirect(@Body(new JoiValidation(AccessTokenValidation)) reqBody) {
    let userData = await this.authService.getAppleUserData(reqBody.accessToken);

    return AppleReturnDataSerializer.serialize(userData);
  }

  @Get('user/testJWT')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  test() {
    console.log('-- test jwt route --');
    return 'User Arrived';
  }
}
