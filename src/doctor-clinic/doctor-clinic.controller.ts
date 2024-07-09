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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DoctorClinicBookingDetailsDTO } from './dtos/doctorClinicBookingDetails.dto';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { FreeSlots } from './dtos/free-slots.dto';
import { DoctorClinicReturnDto } from './dtos/return.dto';
import { DoctorClinicCreateDto } from './dtos/create.dto';
import { ReserveSlotDto } from './dtos/reserve-slot.dto';
import { CardFormatDto } from './dtos/card-format.dto';

@Controller('doctor-clinic')
export class DoctorClinicController {
  constructor(private doctorClinicService: DoctorClinicService) {}

  @ApiCreatedResponse({
    type: DoctorClinicBookingDetailsDTO,
    isArray: true,
  })
  @ApiTags('Doctor-Clinic: Get All')
  @ApiBearerAuth()
  //
  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1() {
    return await this.doctorClinicService.getAll();
  }

  @ApiParam({
    name: 'id',
    required: false,
  })
  @ApiParam({
    name: 'date',
    required: false,
  })
  @ApiCreatedResponse({
    type: FreeSlots,
    isArray: true,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('DAY_NOT_AVAILABLE').init())
  @ApiTags('Doctor-Clinic: Day Available Hours')
  @ApiBearerAuth()
  //
  @Get('/:id/day-available-hours/:date')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async doctorClinicDayAvailableHours1(
    @Param(new JoiValidation(DoctorClinicAvailableHoursValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.doctorClinicService.doctorClinicDayAvailableHours(
      req['id'],
      params.id,
      params.date,
    );
  }

  @ApiParam({
    name: 'id',
  })
  @ApiCreatedResponse({
    type: String,
    isArray: true,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('DAY_NOT_AVAILABLE').init())
  @ApiTags('Doctor-Clinic: Available Upcoming Week')
  @ApiBearerAuth()
  //
  @Get('/:id/available-upcoming-week')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async doctorClinicAvailableUpcomingWeek1(
    @Param(new JoiValidation(DoctorClinicIdValidation)) params,
  ) {
    return await this.doctorClinicService.availableUpcomingWeek(params.id);
  }

  @ApiParam({
    name: 'id',
    required: false,
  })
  @ApiBody({
    type: DoctorClinicCreateDto,
  })
  @ApiCreatedResponse({
    type: DoctorClinicReturnDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('REPEATED_DOCTOR_CLINIC').init())
  @ApiTags('Doctor-Clinic: Create')
  @ApiBearerAuth()
  //
  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async create1(
    @Body(new JoiValidation(AddDoctorClinicValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    return await this.doctorClinicService.create(req['id'], reqBody);
  }

  @ApiParam({
    name: 'id',
  })
  @ApiBody({
    type: ReserveSlotDto,
  })
  @ApiCreatedResponse({
    type: CardFormatDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('DAY_NOT_AVAILABLE').init())
  @ApiTags('Doctor-Clinic: Reserve Slot')
  @ApiBearerAuth()
  //
  @Post('/:id/reserve-slot')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async reserveSlot1(
    @Body(new JoiValidation(ReserveSlotValidation)) reqBody,
    @Param(new JoiValidation(DoctorClinicIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.doctorClinicService.reserveSlot(params.id, req['id'], reqBody);
  }

  @ApiParam({
    name: 'id',
  })
  @ApiCreatedResponse({
    type: DoctorClinicBookingDetailsDTO,
  })
  @ApiTags('Doctor-Clinic: Get One')
  @ApiBearerAuth()
  //
  @Get('/:id')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getOne1(@Param(new JoiValidation(DoctorClinicIdValidation)) params) {
    return await this.doctorClinicService.getOne(params.id);
  }
}
