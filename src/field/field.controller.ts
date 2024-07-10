import {
  Controller,
  Get,
  UseGuards,
  Version,
  Request,
  Body,
  Param,
  Post,
  Query,
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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FieldBookingDetailsDTO } from './dtos/fieldBookingDetails.dto';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { FreeSlots } from './dtos/free-slots.dto';
import { FieldCreateDto } from './dtos/create.dto';
import { FieldReturnDto } from './dtos/return.dto';
import { ReserveSlotDto } from 'src/doctor-clinic/dtos/reserve-slot.dto';
import { FieldCardFormatDto } from './dtos/field-card-format.dto';
import { RegionIdValidation } from './validations/regionId.validation';
import { GetAllFilterDto } from './dtos/get-all-filter.dto';

@Controller('field')
export class FieldController {
  constructor(private fieldService: FieldService) {}

  @ApiQuery({ name: 'regionId', required: false })
  @ApiCreatedResponse({
    type: FieldBookingDetailsDTO,
    isArray: true,
  })
  @ApiTags('Field: Get All')
  @ApiBearerAuth()
  //
  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1(@Query() filter: GetAllFilterDto) {
    return await this.fieldService.getAll(filter);
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
  @ApiTags('Field: Day Available Hours')
  @ApiBearerAuth()
  //
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

  @ApiParam({
    name: 'id',
  })
  @ApiCreatedResponse({
    type: String,
    isArray: true,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('DAY_NOT_AVAILABLE').init())
  @ApiTags('Field: Available Upcoming Week')
  @ApiBearerAuth()
  //
  @Get('/:id/available-upcoming-week')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async fieldAvailableUpcomingWeek1(@Param(new JoiValidation(FieldIdValidation)) params) {
    return await this.fieldService.availableUpcomingWeek(params.id);
  }

  @ApiBody({
    type: FieldCreateDto,
  })
  @ApiCreatedResponse({
    type: FieldReturnDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('REPEATED_FIELD').init())
  @ApiTags('Field: Create')
  @ApiBearerAuth()
  //
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

  @ApiParam({
    name: 'id',
  })
  @ApiBody({
    type: ReserveSlotDto,
  })
  @ApiCreatedResponse({
    type: FieldCardFormatDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('DAY_NOT_AVAILABLE').init())
  @ApiTags('Field: Reserve Slot')
  @ApiBearerAuth()
  //
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

  @ApiParam({
    name: 'id',
  })
  @ApiCreatedResponse({
    type: FieldBookingDetailsDTO,
  })
  @ApiTags('Field: Get One')
  @ApiBearerAuth()
  //
  @Get('/:id')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getOne1(@Param(new JoiValidation(FieldIdValidation)) params) {
    return await this.fieldService.getOne(params.id);
  }
}
