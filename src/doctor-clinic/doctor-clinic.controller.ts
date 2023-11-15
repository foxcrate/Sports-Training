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
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest, query } from 'express';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { ReserveSlotValidation } from './validations/reserve-slot.validation';
import { DoctorClinicService } from './doctor-clinic.service';
import { DoctorClinicAvailableHoursValidation } from './validations/doctor-clinic-available-hours.validation';
import { AddDoctorClinicValidation } from './validations/create.validation';
import { DoctorClinicIdValidation } from './validations/doctor-clinic-id.validaiton';
//NOTE:urls are not camel cased it should be dash separated like this doctor-clinic not doctorClinic
@Controller('doctorClinic')
export class DoctorClinicController {
  constructor(private doctorClinicService: DoctorClinicService) {}

  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1() {
    return this.doctorClinicService.getAll();
  }

  @Get('/:id/doctorClinic-DayAvailableHours/:date')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async doctorClinicDayAvailableHours1(
    @Param(new JoiValidation(DoctorClinicAvailableHoursValidation)) params,
  ) {
    return this.doctorClinicService.doctorClinicDayAvailableHours(params.id, params.date);
  }

  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async create1(
    @Body(new JoiValidation(AddDoctorClinicValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    return this.doctorClinicService.create(req['id'], reqBody);
  }

  //NOTE: you cant' have some endpoints that are camel cased and some that are dash separated use dash speratation for everything please
  @Post('/:id/reserve-slot')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async reserveSlot1(
    @Body(new JoiValidation(ReserveSlotValidation)) reqBody,
    @Param(new JoiValidation(DoctorClinicIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return this.doctorClinicService.reserveSlot(params.id, req['id'], reqBody);
  }

  @Get('/:id')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getOne1(@Param(new JoiValidation(DoctorClinicIdValidation)) params) {
    return this.doctorClinicService.getOne(params.id);
  }
}
