import { Body, Controller, Get, Post, UseGuards, Request, Version } from '@nestjs/common';
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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReturnUserDto } from 'src/user/dtos/return.dto';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { AuthTokensDTO } from './dtos/auth-tokens.dto';
import { SocialMediaReturnDto } from './dtos/social-media-return.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({
    type: SignupUserDto,
  })
  @ApiCreatedResponse({
    type: ReturnUserDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('REPEATED_MOBILE_NUMBER').init())
  @ApiTags('Auth: User Signup')
  //
  @Post('user/signup')
  @Version('1')
  async signup1(@Body(new JoiValidation(SignupValidation)) signupData: SignupUserDto) {
    return await this.authService.userSignup(signupData);
  }

  // @Post('user/send-signup-otp')
  // @Version('1')
  // async sendSignupOtp1(
  //   @Body(new JoiValidation(SendOTPValidation)) sendOTPData: SendOTPDto,
  // ) {
  //   return await this.authService.sendSignupOtp(sendOTPData.mobileNumber);
  // }

  // @Post('user/send-forget-password-otp')
  // @Version('1')
  // async sendForgePasswordOtp1(
  //   @Body(new JoiValidation(SendOTPValidation)) sendOTPData: SendOTPDto,
  // ) {
  //   return await this.authService.sendForgetPasswordOtp(sendOTPData.mobileNumber);
  // }

  // @Post('user/send-change-mobile-otp')
  // @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  // async sendChangeMobileOtp(
  //   @Body(new JoiValidation(SendOTPValidation)) sendOTPData: SendOTPDto,
  // ) {
  //   return await this.authService.sendChangeMobileOtp(sendOTPData.mobileNumber);
  // }

  // @Post('user/send-mobile-otp')
  // @Version('1')
  // @Roles('user', 'child')
  // async sendMobileOtp1(
  //   @Body(new JoiValidation(SendOTPValidation)) sendOTPData: SendOTPDto,
  // ) {
  //   return await this.authService.sendMobileOtp(sendOTPData.mobileNumber);
  // }

  @ApiBody({
    type: CreatePasswordDto,
  })
  @ApiCreatedResponse({
    type: ReturnUserDto,
  })
  @ApiTags('Auth: Create Password')
  //
  @Post('user/create-password')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async createPassword1(
    @Body(new JoiValidation(CreatePasswordValidation))
    createPasswordData: CreatePasswordDto,
    @Request() req: ExpressRequest,
  ) {
    return await this.authService.createPassword(req['id'], createPasswordData.password);
  }

  @ApiBody({
    type: CreatePasswordDto,
  })
  @ApiCreatedResponse({
    type: ReturnUserDto,
  })
  @ApiTags('Auth: Change Password')
  //
  @Post('user/change-password')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async changePassword1(
    @Body(new JoiValidation(CreatePasswordValidation))
    createPasswordData: CreatePasswordDto,
    @Request() req: ExpressRequest,
  ) {
    return await this.authService.changePassword(req['id'], createPasswordData.password);
  }

  @ApiBody({
    type: VerifyOtpDto,
  })
  @ApiCreatedResponse({
    type: AuthTokensDTO,
  })
  @ApiUnauthorizedResponse(
    new SwaggerErrorResponse('EXPIRED_FIREBASE_TOKEN_ERROR').init(),
  )
  @ApiTags('Auth: Verify Signup OTP')
  //
  @Post('user/verify-signup-otp')
  @Version('1')
  async verifyOtp1(
    @Body(new JoiValidation(VerifyOtpValidation)) verifyOtpData: VerifyOtpDto,
    @Request() req: ExpressRequest,
  ) {
    return await this.authService.verifySignupOTP(verifyOtpData, req);
  }

  @ApiBody({
    type: VerifyOtpDto,
  })
  @ApiUnauthorizedResponse(
    new SwaggerErrorResponse('EXPIRED_FIREBASE_TOKEN_ERROR').init(),
  )
  @ApiTags('Auth: Verify Change Mobile OTP')
  @ApiBearerAuth()
  //
  @Post('user/verify-change-mobile-otp')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async verifyChangeMobileOtp1(
    @Body(new JoiValidation(VerifyOtpValidation)) verifyOtpData: VerifyOtpDto,
    @Request() req: ExpressRequest,
  ) {
    return await this.authService.verifyChangeMobileOTP(verifyOtpData, req['id']);
  }

  @ApiBody({
    type: VerifyOtpDto,
  })
  @ApiCreatedResponse({
    type: AuthTokensDTO,
  })
  @ApiUnauthorizedResponse(
    new SwaggerErrorResponse('EXPIRED_FIREBASE_TOKEN_ERROR').init(),
  )
  @ApiTags('Auth: Verify Child Mobile OTP')
  //
  @Post('user/verify-mobile-otp')
  @Version('1')
  @Roles('user', 'child')
  async verifyMobileOtp1(
    @Body(new JoiValidation(VerifyOtpValidation)) verifyOtpData: VerifyOtpDto,
    @Request() req: ExpressRequest,
  ) {
    return await this.authService.verifyChildMobileOtp(verifyOtpData, req);
  }

  @ApiBody({
    type: VerifyOtpDto,
  })
  @ApiCreatedResponse({
    type: AuthTokensDTO,
  })
  @ApiUnauthorizedResponse(
    new SwaggerErrorResponse('EXPIRED_FIREBASE_TOKEN_ERROR').init(),
  )
  @ApiTags('Auth: Verify Forget Password OTP')
  //
  @Post('user/verify-forget-password-otp')
  @Version('1')
  @Roles('user')
  async verifyForgetPasswordOtp1(
    @Body(new JoiValidation(VerifyOtpValidation)) verifyOtpData: VerifyOtpDto,
    @Request() req: ExpressRequest,
  ) {
    return await this.authService.verifyForgetPasswordOTP(verifyOtpData, req);
  }

  @ApiBody({
    type: SignupUserDto,
  })
  @ApiCreatedResponse({
    type: ReturnUserDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('REPEATED_EMAIL').init())
  @ApiTags('Auth: User Complete Signup')
  @Post('user/complete-signup')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async completeSignup1(
    @Body(new JoiValidation(CompleteSignupValidation)) completeSignupData: SignupUserDto,
    @Request() req: ExpressRequest,
  ) {
    return await this.authService.userCompleteSignup(req['id'], completeSignupData);
  }

  @ApiBody({
    type: SigninUserDto,
  })
  @ApiCreatedResponse({
    type: AuthTokensDTO,
  })
  @ApiUnauthorizedResponse(new SwaggerErrorResponse('WRONG_CREDENTIALS').init())
  @ApiTags('Auth: User Signin')
  @Post('/user/signin')
  @Version('1')
  async userSignin1(
    @Body(new JoiValidation(UserSigninValidation)) signinData: SigninUserDto,
    @Request() req: ExpressRequest,
  ) {
    return await this.authService.userSignin(signinData, req);
  }

  // @ApiBody({
  //   type: SigninUserDto,
  // })
  // @ApiCreatedResponse({
  //   type: AuthTokensDTO,
  // })
  // @ApiUnauthorizedResponse(new SwaggerErrorResponse('ACCOUNT_NOT_ACTIVATED').init())
  // @ApiTags('Auth: Child Signin')
  // @Post('/child/signin')
  // @Version('1')
  // async childSignin(
  //   @Body(new JoiValidation(UserSigninValidation)) signinData: SigninUserDto,
  //   @Request() req: ExpressRequest,
  // ) {
  //   return await this.authService.childSignin(signinData, req);
  // }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: AuthTokensDTO,
  })
  @ApiUnauthorizedResponse(new SwaggerErrorResponse('WRONG_CREDENTIALS').init())
  @ApiTags('Auth: Refresh Token')
  @Get('refresh-token')
  @Version('1')
  async refreshToken(@Body('refreshToken') refreshToken, @Request() req: ExpressRequest) {
    return await this.authService.refreshToken(refreshToken, req);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: SocialMediaReturnDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('GOOGLE_TOKEN_ERROR').init())
  @ApiTags('Auth: Google Data')
  @Post('google-data')
  @Version('1')
  async googleRedirect(@Body(new JoiValidation(AccessTokenValidation)) reqBody) {
    let userData = await this.authService.getGoogleUserData(reqBody.accessToken);

    return GoogleReturnDataSerializer.serialize(userData);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: SocialMediaReturnDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('FACEBOOK_TOKEN_ERROR').init())
  @ApiTags('Auth: Facebook Data')
  @Post('facebook-data')
  @Version('1')
  async facebookRedirect(@Body(new JoiValidation(AccessTokenValidation)) reqBody) {
    let userData = await this.authService.getFacebookUserData(reqBody.accessToken);

    return FacebookReturnDataSerializer.serialize(userData);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
      },
    },
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('APPLE_TOKEN_ERROR').init())
  @ApiTags('Auth: Apple Data')
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
