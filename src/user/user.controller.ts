import { Body, Controller, Post, UsePipes, Version } from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.dto';
import { SignupSchema } from './schema/signup.schema';
import { JoiValidation } from '../pipes/joiValidaiton.pipe';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Version('1')
  @Post('signup')
  @UsePipes(new JoiValidation(SignupSchema))
  async signup1(@Body() userData: CreateUserDto) {
    return 'alo';
    // return this.userService.signup(userData);
  }
}
