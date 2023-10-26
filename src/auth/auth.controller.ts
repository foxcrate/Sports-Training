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
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
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
import { GoogleReturnDataSerializer } from './serializers/google-return-data.serializer';
import { FacebookReturnDataSerializer } from './serializers/facebook-return-data.serializer';
import { SignupByMobileValidation } from 'src/user/validations/signup-mobile.validation';
import { SendOTPValidation } from './validations/send-otp.validation';
import { VerifyOtpValidation } from './validations/verify-otp.validation';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { CreatePasswordDto } from './dtos/create-password.dto';
import { SendOTPDto } from './dtos/send-otp.validation';
import { CreatePasswordValidation } from './validations/create-password.validaiton';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('user/signup')
  @Version('1')
  // @UsePipes(new JoiValidation(SignupValidation))
  async signup1(@Body(new JoiValidation(SignupValidation)) signupData: SignupUserDto) {
    return this.authService.userSignup(signupData);
  }

  @Post('user/send-signup-otp')
  @Version('1')
  // @UsePipes(new JoiValidation(SignupValidation))
  async sendOtp1(@Body(new JoiValidation(SendOTPValidation)) sendOTPData: SendOTPDto) {
    return this.authService.sendOtp(sendOTPData.mobileNumber);
  }

  @Post('user/create-password')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  // @UsePipes(new JoiValidation(SignupValidation))
  async createPassword1(
    @Body(new JoiValidation(CreatePasswordValidation))
    createPasswordData: CreatePasswordDto,
    @Request() req: ExpressRequest,
  ) {
    return this.authService.createPassword(req['id'], createPasswordData.password);
  }

  @Get('user/verify-signup-otp')
  @Version('1')
  // @UsePipes(new JoiValidation(SignupValidation))
  async verifyOtp1(
    @Body(new JoiValidation(VerifyOtpValidation)) verifyOtpData: VerifyOtpDto,
  ) {
    return this.authService.verifyOTP(verifyOtpData);
  }

  @Post('/user/signin')
  @Version('1')
  // @UsePipes(new JoiValidation(UserSigninValidation))
  async userSignin1(
    @Body(new JoiValidation(UserSigninValidation)) signinData: SigninUserDto,
  ) {
    return this.authService.userSignin(signinData);
  }

  @Post('/child/signin')
  @Version('1')
  // @UsePipes(new JoiValidation(ChildSigninValidation))
  async childSignin(
    @Body(new JoiValidation(ChildSigninValidation)) signinData: SigninChildDto,
  ) {
    return this.authService.childSignin(signinData);
  }

  @Get('refresh-token')
  @Version('1')
  refreshToken(@Body('refreshToken') refreshToken, @Request() req: ExpressRequest) {
    return this.authService.refreshToken(refreshToken, req['authType']);
  }

  @Get('user/testJWT')
  @Version('1')
  @Roles('child')
  @UseGuards(AuthGuard, RoleGuard)
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
