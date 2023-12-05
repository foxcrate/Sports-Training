import {
  Controller,
  Post,
  UseGuards,
  Version,
  Request,
  UsePipes,
  Body,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UserService } from './user.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddChildValidation } from 'src/user/validations/add-child.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { GetOneChildValidation } from './validations/get-one-child.validation';
import { UpdateChildValidation } from './validations/update-child.validation';
import { UpdateUserValidation } from './validations/update-user.validation';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';
import { ChildIdValidation } from 'src/child-profile/validations/child-id.validation';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Put()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(UpdateUserValidation))
  async update1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.userService.update(reqBody, req['id']);
  }

  @Get()
  @Version('1')
  @Roles(AvailableRoles.User)
  @UseGuards(AuthGuard, RoleGuard)
  async getOne(@Request() req: ExpressRequest) {
    return this.userService.getOne(req['id']);
  }

  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddChildValidation))
  async createChild1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.userService.createChild(reqBody, req['id']);
  }

  @Get('childs')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getChilds(@Request() req: ExpressRequest) {
    return this.userService.getChilds(req['id']);
  }

  @Get('childs/:childId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(GetOneChildValidation))
  async getChild(@Param() params, @Request() req: ExpressRequest) {
    return this.userService.getChild(params.childId, req['id']);
  }

  @Put('childs/:childId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  // @UsePipes(new JoiValidation(UpdateChildValidation))
  async updateChild(
    @Body(new JoiValidation(UpdateChildValidation)) reqBody,
    @Param(new JoiValidation(ChildIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return this.userService.updateChild(reqBody, params.childId, req['id']);
  }

  @Delete('childs/:childId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(GetOneChildValidation))
  async deleteChild(@Param() params, @Request() req: ExpressRequest) {
    return this.userService.deleteChild(params.childId, req['id']);
  }

  @Get('test')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async test(@Request() req: ExpressRequest) {
    return await this.userService.getChilds(req['id']);
  }
}
