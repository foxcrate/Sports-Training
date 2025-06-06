import {
  Controller,
  Get,
  UseGuards,
  Request,
  Version,
  Body,
  Param,
  Post,
  Delete,
  Put,
} from '@nestjs/common';
import { TrainerScheduleService } from './trainer-schedule.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Request as ExpressRequest } from 'express';
import { ScheduleIdValidation } from './validations/scheduleId.validation';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddScheduleValidation } from './validations/create.validation';
import { UserId } from 'src/decorators/user-id.decorator';
import { TrainerScheduleRepository } from './trainer-schedule.repository';
import { TrainerProfileRepository } from 'src/trainer-profile/trainer-profile.repository';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ScheduleSlotsDetailsDTO } from './dtos/schedule-slots-details';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { ScheduleWithSlotsCreateDto } from './dtos/schedule-with-slots-create.dto';

@Controller('trainer-schedule')
export class TrainerScheduleController {
  constructor(
    private scheduleService: TrainerScheduleService,
    private trainerScheduleRepository: TrainerScheduleRepository,
    private trainerProfileRepository: TrainerProfileRepository,
  ) {}

  @ApiCreatedResponse({
    type: ScheduleSlotsDetailsDTO,
    isArray: true,
  })
  @ApiTags('Trainer-Schedule: Trainer: Get All')
  @ApiBearerAuth()
  //
  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll1(@UserId() userId: number) {
    return await this.scheduleService.getAll(userId);
  }

  @ApiBody({
    type: ScheduleWithSlotsCreateDto,
  })
  @ApiCreatedResponse({
    type: ScheduleSlotsDetailsDTO,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('TRAINER_ALREADY_HAS_SCHEDULE').init())
  @ApiTags('Trainer-Schedule: Trainer: Create')
  @ApiBearerAuth()
  //
  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async create1(
    @Body(new JoiValidation(AddScheduleValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    return await this.scheduleService.create(req['timezone'], req['id'], reqBody);
  }

  @ApiParam({
    name: 'id',
  })
  @ApiBody({
    type: ScheduleWithSlotsCreateDto,
  })
  @ApiCreatedResponse({
    type: ScheduleSlotsDetailsDTO,
  })
  @ApiForbiddenResponse(new SwaggerErrorResponse('NOT_ALLOWED').init())
  @ApiTags('Trainer-Schedule: Trainer: Update')
  @ApiBearerAuth()
  //
  @Put('/:id')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async update(
    @Param(new JoiValidation(ScheduleIdValidation)) params,
    @Body(new JoiValidation(AddScheduleValidation)) reqBody,
    @Request() req: ExpressRequest,
  ) {
    ///////// Temproray, Trainer has one schedule /////////
    if (params.id == 0) {
      let trainerProfile = await this.trainerProfileRepository.getByUserId(req['id']);
      params.id = await this.trainerScheduleRepository.getTrainerScheduleId(
        trainerProfile.id,
      );
      return await this.scheduleService.update(
        req['timezone'],
        req['id'],
        params.id,
        reqBody,
      );
    }
    //////////
    return await this.scheduleService.update(
      req['timezone'],
      req['id'],
      params.id,
      reqBody,
    );
  }

  @ApiParam({
    name: 'id',
  })
  @ApiCreatedResponse({
    type: ScheduleSlotsDetailsDTO,
  })
  @ApiForbiddenResponse(new SwaggerErrorResponse('NOT_ALLOWED').init())
  @ApiTags('Trainer-Schedule: Trainer: Delete')
  @ApiBearerAuth()
  //
  @Delete('/:id')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async delete1(
    @Param(new JoiValidation(ScheduleIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    ///////// Temproray, Trainer has one schedule /////////
    if (params.id == 0) {
      let trainerProfile = await this.trainerProfileRepository.getByUserId(req['id']);
      params.id = await this.trainerScheduleRepository.getTrainerScheduleId(
        trainerProfile.id,
      );
      return await this.scheduleService.delete(req['timezone'], req['id'], params.id);
    }
    //////////
    return await this.scheduleService.delete(req['timezone'], req['id'], params.id);
  }

  @ApiParam({
    name: 'id',
  })
  @ApiCreatedResponse({
    type: ScheduleSlotsDetailsDTO,
  })
  @ApiForbiddenResponse(new SwaggerErrorResponse('NOT_ALLOWED').init())
  @ApiTags('Trainer-Schedule: Trainer: Get One')
  @ApiBearerAuth()
  //
  @Get('/:id')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getOne1(
    @Param(new JoiValidation(ScheduleIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    ///////// Temproray, Trainer has one schedule /////////
    if (params.id == 0) {
      let trainerProfile = await this.trainerProfileRepository.getByUserId(req['id']);
      params.id = await this.trainerScheduleRepository.getTrainerScheduleId(
        trainerProfile.id,
      );
      return await this.scheduleService.getOne(req['timezone'], req['id'], params.id);
    }
    //////////
    return await this.scheduleService.getOne(req['timezone'], req['id'], params.id);
  }
}
