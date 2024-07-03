import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Version,
  Request,
  Get,
} from '@nestjs/common';
import { DoctorClinicSpecializationService } from './doctor-clinic-specialization.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Request as ExpressRequest } from 'express';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { AddDoctorClinicSpecializationValidation } from './validations/create.validation';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReturnDoctorClinicSpecializationDto } from './dtos/retrun.dto';
import { CreateDoctorClinicSpecializationDto } from './dtos/create.dto';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';

@Controller('doctor-clinic-specialization')
export class DoctorClinicSpecializationController {
  constructor(
    private doctorClinicSpecializationService: DoctorClinicSpecializationService,
  ) {}

  @ApiCreatedResponse({
    type: ReturnDoctorClinicSpecializationDto,
    isArray: true,
  })
  @ApiTags('Doctor-Clinic Specialization: Get All')
  @ApiBearerAuth()
  //
  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll() {
    return await this.doctorClinicSpecializationService.getAll();
  }

  @ApiBody({
    type: CreateDoctorClinicSpecializationDto,
  })
  @ApiCreatedResponse({
    type: ReturnDoctorClinicSpecializationDto,
  })
  @ApiBadRequestResponse(
    new SwaggerErrorResponse('REPEATED_DOCTOR_CLINIC_SPECIALIZATION').init(),
  )
  @ApiTags('Doctor-Clinic Specialization: Create')
  @ApiBearerAuth()
  //
  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddDoctorClinicSpecializationValidation))
  async create1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.doctorClinicSpecializationService.create(reqBody);
  }
}
