import {
  Body,
  Controller,
  Post,
  UseFilters,
  UsePipes,
  Version,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create.dto';
import { SignupValidation } from './validations/signup.validation';
import { JoiValidation } from '../pipes/joiValidaiton.pipe';
import { BadRequestFilter } from 'src/filters/badRequest.filter';

@UseFilters(BadRequestFilter)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Version('1')
  @Post('signup')
  @UsePipes(new JoiValidation(SignupValidation))
  async signup1(@Body() userData: CreateUserDto) {
    return this.userService.signup(userData);
  }
}
