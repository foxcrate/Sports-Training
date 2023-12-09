import {
  Controller,
  Get,
  UseGuards,
  Version,
  Request,
  Body,
  Param,
  Query,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest, query } from 'express';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { NotAvailableDatesValidation } from './validations/not-available-dates.valdiaiton';
import { AdminDoctorClinicService } from './admin-doctor-clinic.service';
import { AddDoctorClinicValidation } from './validations/create.validation';
import { UpdateDoctorClinicValidation } from './validations/update.validation';
import { DoctorClinicIdValidation } from './validations/doctor-clinic-id.validaiton';
import { DoctorClinicAcceptanceStatusDto } from './dtos/doctor-clinic-acceptance-status.dto';

@Controller('admin/doctor-clinic')
export class AdminDoctorClinicController {
  constructor(private adminDoctorClinicService: AdminDoctorClinicService) {}

  @Get()
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1() {
    return await this.adminDoctorClinicService.getAll();
  }

  @Post()
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async create1(
    @Body(new JoiValidation(AddDoctorClinicValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    return await this.adminDoctorClinicService.create(reqBody);
  }

  @Put('/:id')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async update1(
    @Body(new JoiValidation(UpdateDoctorClinicValidation)) reqBody,
    @Param(new JoiValidation(DoctorClinicIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.adminDoctorClinicService.update(params.id, reqBody);
  }

  @Delete('/:id')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async delete1(@Param() params) {
    return await this.adminDoctorClinicService.delete(params.id);
  }

  @Get('/pending-doctor-clinics')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async getPendingDoctorClinics1() {
    return await this.adminDoctorClinicService.getPendingDoctorClinics();
  }

  @Put('/:id/accept-doctor-clinic-request')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async acceptDoctorClinicRequest1(
    @Param(new JoiValidation(DoctorClinicIdValidation)) params,
  ) {
    return await this.adminDoctorClinicService.changeDoctorClinicAcceptanceStatue(
      params.id,
      DoctorClinicAcceptanceStatusDto.Accepted,
    );
  }

  @Put('/:id/decline-doctor-clinic-request')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async declineDoctorClinicRequest1(
    @Param(new JoiValidation(DoctorClinicIdValidation)) params,
  ) {
    return await this.adminDoctorClinicService.changeDoctorClinicAcceptanceStatue(
      params.id,
      DoctorClinicAcceptanceStatusDto.Declined,
    );
  }

  @Post('/:id/add-not-available-days')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async addNotAvailableDays1(
    @Body(new JoiValidation(NotAvailableDatesValidation)) reqBody,
    @Param(new JoiValidation(DoctorClinicIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.adminDoctorClinicService.addNotAvailableDays(
      Number(params.id),
      reqBody.notAvailableDays,
    );
  }

  @Get('/:id')
  @Version('1')
  @Roles('admin')
  @UseGuards(AuthGuard, RoleGuard)
  async getOne1(@Param(new JoiValidation(DoctorClinicIdValidation)) params) {
    return await this.adminDoctorClinicService.getOne(params.id);
  }
}
