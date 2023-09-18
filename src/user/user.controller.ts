import {
  Controller,
  Post,
  UseGuards,
  Version,
  Request,
  UsePipes,
  Body,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UserService } from './user.service';
import { JoiValidation } from 'src/pipes/joi_validaiton.pipe';
import { AddChildValidation } from 'src/user/validations/add_child.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // @Version('1')
  // @UseGuards(AuthGuard)
  // @Post('verify_phone')
  // async verifyPhone1(@Request() req: ExpressRequest) {
  //   return this.userService.verifyPhone(req);
  // }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Post('add_child')
  @UsePipes(new JoiValidation(AddChildValidation))
  async addChild1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.userService.addChild(reqBody, req['id']);
  }
}
