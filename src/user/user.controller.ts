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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { updateDto } from './dtos/update.dto';
import { ReturnUserDto } from './dtos/return.dto';
import { AddChildDto } from './dtos/add-child.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiBody({
    type: updateDto,
  })
  @ApiCreatedResponse({
    type: ReturnUserDto,
  })
  @ApiTags('User: Update')
  @ApiBearerAuth()
  //
  @Put()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(UpdateUserValidation))
  async update1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.userService.update(reqBody, req['id']);
  }

  @ApiCreatedResponse({
    type: ReturnUserDto,
  })
  @ApiTags('User: GetOne')
  @ApiBearerAuth()
  //
  @Get()
  @Version('1')
  @Roles(AvailableRoles.User)
  @UseGuards(AuthGuard, RoleGuard)
  async getOne(@Request() req: ExpressRequest) {
    return await this.userService.getOne(req['id']);
  }

  @ApiBody({
    type: AddChildDto,
  })
  @ApiCreatedResponse({
    type: ReturnUserDto,
  })
  @ApiTags('User: Create Child')
  @ApiBearerAuth()
  //
  @Post('childs')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddChildValidation))
  async createChild1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.userService.createChild(reqBody, req['id']);
  }

  @ApiCreatedResponse({
    type: ReturnUserDto,
    isArray: true,
  })
  @ApiTags('User: Get Children')
  @ApiBearerAuth()
  //
  @Get('childs')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getChilds(@Request() req: ExpressRequest) {
    return await this.userService.getChilds(req['id']);
  }

  @ApiParam({
    name: 'childId',
  })
  @ApiCreatedResponse({
    type: ReturnUserDto,
  })
  @ApiTags('User: Get One Child')
  @ApiBearerAuth()
  //
  @Get('childs/:childId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(GetOneChildValidation))
  async getChild(@Param() params, @Request() req: ExpressRequest) {
    return await this.userService.getChild(params.childId, req['id']);
  }

  @ApiParam({
    name: 'childId',
    required: true,
  })
  @ApiBody({
    type: updateDto,
  })
  @ApiCreatedResponse({
    type: ReturnUserDto,
  })
  @ApiTags('User: Update Child')
  @ApiBearerAuth()
  //
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
    return await this.userService.updateChild(reqBody, params.childId, req['id']);
  }

  @ApiParam({
    name: 'childId',
  })
  @ApiCreatedResponse({
    type: ReturnUserDto,
  })
  @ApiTags('User: Delete Child')
  @ApiBearerAuth()
  //
  @Delete('childs/:childId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(GetOneChildValidation))
  async deleteChild(@Param() params, @Request() req: ExpressRequest) {
    return await this.userService.deleteChild(params.childId, req['id']);
  }

  @Get('test')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async test(@Request() req: ExpressRequest) {
    return await this.userService.getChilds(req['id']);
  }
}
