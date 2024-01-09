import {
  Controller,
  Get,
  UseGuards,
  Request,
  Version,
  Body,
  Param,
  Post,
  UsePipes,
  Delete,
  Put,
  Headers,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest } from 'express';
import { ScheduleIdValidation } from './validations/scheduleId.validation';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddScheduleValidation } from './validations/create.validation';
import { NotAvailableDatesValidation } from 'src/field/validations/not-available-dates.valdiaiton';
import { TrainerProfileIdValidation } from '../trainer-profile/validations/trainer-profile-id.validation';
import { FieldSlotsValidation } from './validations/field-slots.validation';
import { TrainerDayFieldSlotsValidation } from './validations/trainer-day-field-slots.validation';
import { BookTrainerSessionValidation } from './validations/book-trainer-session.validation';

@Controller('trainer-schedule')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1(@Body() reqBody, @Param() params, @Request() req: ExpressRequest) {
    return await this.scheduleService.getAll(req['id']);
  }

  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async create1(
    @Body(new JoiValidation(AddScheduleValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    // return 'alo';
    return await this.scheduleService.create(req['timezone'], req['id'], reqBody);
  }

  @Put('/:id')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async update(
    @Param(new JoiValidation(ScheduleIdValidation)) params,
    @Body(new JoiValidation(AddScheduleValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    return await this.scheduleService.update(
      req['timezone'],
      req['id'],
      params.id,
      reqBody,
    );
  }

  @Delete('/:id')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async delete1(
    @Param(new JoiValidation(ScheduleIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.scheduleService.delete(req['timezone'], req['id'], params.id);
  }

  @Get('/:id')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getOne1(
    @Param(new JoiValidation(ScheduleIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.scheduleService.getOne(req['timezone'], req['id'], params.id);
  }

  @Get('/:trainerProfileId/fields')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getTrainerFields1(@Param(new JoiValidation(TrainerProfileIdValidation)) params) {
    return await this.scheduleService.getTrainerFields(params.trainerProfileId);
  }

  @Get('/:trainerProfileId/available-upcoming-week/:fieldId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getTrainerFieldSlotsForThisWeek1(
    @Param(new JoiValidation(FieldSlotsValidation)) params,
  ) {
    return await this.scheduleService.getTrainerFieldDaysForThisWeek(
      params.trainerProfileId,
      params.fieldId,
    );
  }

  @Get('/:trainerProfileId/day-field-slots/:fieldId/:dayDate')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getTrainerDaySlots1(
    @Param(new JoiValidation(TrainerDayFieldSlotsValidation)) params,
  ) {
    return await this.scheduleService.getTrainerDayFieldSlots(
      params.trainerProfileId,
      params.fieldId,
      params.dayDate,
    );
  }

  @Post('/book-session')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async bookTrainerSession(
    @Body(new JoiValidation(BookTrainerSessionValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    return await this.scheduleService.bookTrainerSession(
      req['id'],
      reqBody.trainerProfileId,
      reqBody.dayDate,
      reqBody.slotId,
    );
  }
}
