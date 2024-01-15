import {
  Controller,
  Get,
  UseGuards,
  Request,
  Version,
  Body,
  Param,
  Post,
} from '@nestjs/common';
import { TrainerScheduleService } from './trainer-schedule.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest } from 'express';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { TrainerProfileIdValidation } from '../trainer-profile/validations/trainer-profile-id.validation';
import { FieldSlotsValidation } from './validations/field-slots.validation';
import { TrainerDayFieldSlotsValidation } from './validations/trainer-day-field-slots.validation';
import { BookTrainerSessionValidation } from './validations/book-trainer-session.validation';
import { UserId } from 'src/decorators/user-id.decorator';

@Controller('user/trainer-schedule')
export class UserTrainerScheduleController {
  constructor(private scheduleService: TrainerScheduleService) {}

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
    @UserId() userId: number,
  ) {
    return await this.scheduleService.bookTrainerSession(
      userId,
      reqBody.trainerProfileId,
      reqBody.dayDate,
      reqBody.slotId,
    );
  }
}
