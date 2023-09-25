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

@Controller('child_profile')
export class ChildProfileController {
  constructor(private childProfileService: ChildProfileService) {}

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  @UsePipes(new JoiValidation(AddChildProfileValidation))
  async create1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.childProfileService.create(reqBody, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/:childProfileId')
  @UsePipes(new JoiValidation(UpdateChildProfileValidation))
  async update1(@Param() params, @Body() reqBody, @Request() req: ExpressRequest) {
    //throw error if path params validation failed
    this.validatePathParams(req.params);
    return this.childProfileService.update(reqBody, params.childProfileId);
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
    return this.childProfileService.getOne(req['id'], childProfileId);
  }

  private validatePathParams(reqParams) {
    const pathParamSchema = Joi.object({
      childProfileId: Joi.number().integer().positive().required(),
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
