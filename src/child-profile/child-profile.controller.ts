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
  Param,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ChildProfileService } from './child-profile.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddChildProfileValidation } from './validations/create.validation';
import { UpdateChildProfileValidation } from './validations/update.validation';
import { DeleteChildProfileValidation } from './validations/delete.validation';
import { GetOneChildProfileValidation } from './validations/get-one.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { ChildIdValidation } from './validations/child-id.validation';
import { ChildProfileIdValidation } from './validations/child-profile-id.validaiton';

@Controller('child-profile')
export class ChildProfileController {
  constructor(private childProfileService: ChildProfileService) {}

  @Post('/:childId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async create1(
    @Body(new JoiValidation(AddChildProfileValidation)) reqBody,
    @Param(new JoiValidation(ChildIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return this.childProfileService.create(reqBody, params.childId, req['id']);
  }

  @Put('/:childProfileId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  // @UsePipes(new JoiValidation(UpdateChildProfileValidation))
  async update1(
    @Body(new JoiValidation(UpdateChildProfileValidation)) reqBody,
    @Param(new JoiValidation(ChildProfileIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return this.childProfileService.update(reqBody, params.childProfileId, req['id']);
  }

  @Delete('/:childProfileId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(DeleteChildProfileValidation))
  async delete1(@Param() params, @Request() req: ExpressRequest) {
    const childProfileId = params.childProfileId;
    return this.childProfileService.delete(req['id'], childProfileId);
  }

  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1(@Request() req: ExpressRequest) {
    return this.childProfileService.getAll(req['id']);
  }

  @Get('/:childProfileId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(GetOneChildProfileValidation))
  async getOne1(@Param() params, @Request() req: ExpressRequest) {
    const childProfileId = params.childProfileId;
    // console.log("req['id']:", req['id']);

    return this.childProfileService.getOne(req['id'], childProfileId);
  }
}
