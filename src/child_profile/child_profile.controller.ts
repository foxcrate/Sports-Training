import {
  Controller,
  Post,
  UseGuards,
  Version,
  Request,
  UsePipes,
  Body,
  Put,
  Delete,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ChildProfileService } from './child_profile.service';
import { JoiValidation } from 'src/pipes/joi_validaiton.pipe';
import { AddChildProfileValidation } from './validations/create.validation';
import { UpdateChildProfileValidation } from './validations/update.validation';
import { UpdateChildProfileParamsValidation } from './validations/update_params.validation';
import { DeleteChildProfileValidation } from './validations/delete.validation';
import { GetOneChildProfileValidation } from './validations/get_one.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import * as Joi from 'joi';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { NewBadRequestException } from 'src/exceptions/new_bad_request.exception';
import { ChildIdValidation } from './validations/childId.validation';
import { ChildProfileIdValidation } from './validations/childProfileId.validaiton';

@Controller('child_profile')
export class ChildProfileController {
  constructor(private childProfileService: ChildProfileService) {}

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/:childId')
  async create1(
    @Body(new JoiValidation(AddChildProfileValidation)) reqBody,
    @Param(new JoiValidation(ChildIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return this.childProfileService.create(reqBody, params.childId, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/:childProfileId')
  // @UsePipes(new JoiValidation(UpdateChildProfileValidation))
  async update1(
    @Body(new JoiValidation(UpdateChildProfileValidation)) reqBody,
    @Param(new JoiValidation(ChildProfileIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return this.childProfileService.update(reqBody, params.childProfileId, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(DeleteChildProfileValidation))
  @Delete('/:childProfileId')
  async delete1(@Param() params, @Request() req: ExpressRequest) {
    const childProfileId = params.childProfileId;
    return this.childProfileService.delete(req['id'], childProfileId);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  async getAll1(@Request() req: ExpressRequest) {
    return this.childProfileService.getAll(req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(GetOneChildProfileValidation))
  @Get('/:childProfileId')
  async getOne1(@Param() params, @Request() req: ExpressRequest) {
    const childProfileId = params.childProfileId;
    // console.log("req['id']:", req['id']);

    return this.childProfileService.getOne(req['id'], childProfileId);
  }
}
