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
import { JoiValidation } from 'src/pipes/joi_validaiton.pipe';
import { AddChildValidation } from 'src/user/validations/add_child.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import * as Joi from 'joi';
import { GetOneChildValidation } from './validations/get_one_child.validation';
import { NewBadRequestException } from 'src/exceptions/new_bad_request.exception';
import { UpdateChildValidation } from './validations/update_child.validation';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  async getOne(@Request() req: ExpressRequest) {
    return this.userService.getOne(req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  @UsePipes(new JoiValidation(AddChildValidation))
  async createChild1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.userService.createChild(reqBody, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Get('childs')
  async getChilds(@Request() req: ExpressRequest) {
    return this.userService.getChilds(req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(GetOneChildValidation))
  @Get('childs/:childId')
  async getChild(@Param() params, @Request() req: ExpressRequest) {
    // return params.childId;
    return this.userService.getChild(params.childId, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(UpdateChildValidation))
  @Put('childs/:childId')
  async updateChild(@Body() reqBody, @Request() req: ExpressRequest) {
    //throw error if path params validation failed
    this.validatePathParams(req.params);
    return this.userService.updateChild(reqBody, req.params.childId, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(GetOneChildValidation))
  @Delete('childs/:childId')
  async deleteChild(@Param() params, @Request() req: ExpressRequest) {
    // return params.childId;
    return this.userService.deleteChild(params.childId, req['id']);
  }

  @Version('1')
  @Get('test')
  test() {
    return this.userService.test();
  }

  private validatePathParams(reqParams) {
    const pathParamSchema = Joi.object({
      childId: Joi.number().integer().positive().required(),
    });

    const { error } = pathParamSchema.validate(reqParams);

    if (error) {
      let errorMessages = error.details.map((details) => {
        return {
          path: details.path[0],
          message: details.message.replace(/"/g, ''),
        };
      });
      throw new NewBadRequestException({
        code: 'VALIDATION_ERROR',
        message: errorMessages,
      });
    }
  }
}
