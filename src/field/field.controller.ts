import {
  Controller,
  Get,
  UseGuards,
  Version,
  Request,
  Body,
  Param,
  Post,
} from '@nestjs/common';
import { FieldService } from './field.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest, query } from 'express';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddFieldValidation } from './validations/create.validation';
import { FieldAvailableHoursValidation } from './validations/field-available-hours.validation';
import { FieldIdValidation } from './validations/field-id.validaiton';
import { ReserveSlotValidation } from './validations/reserve-slot.validation';

@Controller('field')
export class FieldController {
  constructor(private fieldService: FieldService) {}

  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1() {
    return await this.fieldService.getAll();
  }

  @Get('/:id/day-available-hours/:date')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async fieldDayAvailableHours1(
    @Param(new JoiValidation(FieldAvailableHoursValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.fieldService.fieldDayAvailableHours(
      req['id'],
      params.id,
      params.date,
    );
  }

  @Get('/:id/available-upcoming-week')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async fieldAvailableUpcomingWeek1(@Param(new JoiValidation(FieldIdValidation)) params) {
    return await this.fieldService.availableUpcomingWeek(params.id);
  }

  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async create1(
    @Body(new JoiValidation(AddFieldValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    return await this.fieldService.create(req['id'], reqBody);
  }

  @Post('/:id/reserve-slot')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async reserveSlot1(
    @Body(new JoiValidation(ReserveSlotValidation)) reqBody,
    @Param(new JoiValidation(FieldIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.fieldService.reserveSlot(params.id, req['id'], reqBody);
  }

  @Get('/:id')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getOne1(@Param(new JoiValidation(FieldIdValidation)) params) {
    return await this.fieldService.getOne(params.id);
  }
}
