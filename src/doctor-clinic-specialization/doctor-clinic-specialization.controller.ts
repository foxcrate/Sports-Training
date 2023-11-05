import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Version,
  Request,
} from '@nestjs/common';
import { DoctorClinicSpecializationService } from './doctor-clinic-specialization.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Request as ExpressRequest } from 'express';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { AddDoctorClinicSpecializationValidation } from './validations/create.validation';

@Controller('doctor-clinic-specialization')
export class DoctorClinicSpecializationController {
  constructor(
    private doctorClinicSpecializationService: DoctorClinicSpecializationService,
  ) {}

  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddDoctorClinicSpecializationValidation))
  async create1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.doctorClinicSpecializationService.create(reqBody, req['id']);
  }
}
