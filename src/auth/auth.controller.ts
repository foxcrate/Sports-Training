import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  Version,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoiValidation } from 'src/pipes/joiValidaiton.pipe';
import { SignupValidation } from 'src/user/validations/signup.validation';
import { SigninValidation } from 'src/user/validations/signin.validaiton';
import { SignupUserDto } from 'src/user/dtos/signup.dto';
import { SigninUserDto } from 'src/user/dtos/signin.dto';
import { AuthGuard } from 'src/guards/auth.guard';

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
  @UsePipes(new JoiValidation(SigninValidation))
  async signin1(@Body() signinData: SigninUserDto) {
    return this.authService.userSignin(signinData);
  }

  @Version('1')
  @UseGuards(AuthGuard)
  @Get('testJWT')
  test() {
    return 'Arrived';
  }

  @Version('1')
  @Get('refresh_token')
  refreshToken(@Body('refreshToken') refreshToken) {
    return this.authService.refreshToken(refreshToken);
  }
}
