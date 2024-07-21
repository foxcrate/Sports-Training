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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { SimplifiedFieldReturn } from 'src/field/dtos/field-simplified-return.dto';
import { UserSlotState } from './dtos/user-slot-state.dto';
import { SessionCardDTO } from 'src/session/dtos/session-card.dto';

@Controller('user/trainer-schedule')
export class UserTrainerScheduleController {
  constructor(private scheduleService: TrainerScheduleService) {}

  @ApiParam({
    name: 'trainerProfileId',
  })
  @ApiCreatedResponse({
    type: SimplifiedFieldReturn,
    isArray: true,
  })
  @ApiTags('Trainer-Schedule: User: Get Trainer Fields')
  @ApiBearerAuth()
  //
  @Get('/:trainerProfileId/fields')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getTrainerFields1(@Param(new JoiValidation(TrainerProfileIdValidation)) params) {
    return await this.scheduleService.getTrainerFields(params.trainerProfileId);
  }

  @ApiParam({
    name: 'trainerProfileId',
  })
  @ApiParam({
    name: 'fieldId',
  })
  @ApiCreatedResponse({
    type: String,
    isArray: true,
  })
  @ApiTags('Trainer-Schedule: User: Get Trainer Field Days For This Week')
  @ApiBearerAuth()
  //
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

  @ApiParam({
    name: 'trainerProfileId',
  })
  @ApiParam({
    name: 'fieldId',
  })
  @ApiParam({
    name: 'dayDate',
  })
  @ApiCreatedResponse({
    type: UserSlotState,
    isArray: true,
  })
  @ApiTags('Trainer-Schedule: User: Get Trainer Day Field Slots')
  @ApiBearerAuth()
  //
  @Get('/:trainerProfileId/day-field-slots/:fieldId/:dayDate')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getTrainerDaySlots1(
    @Param(new JoiValidation(TrainerDayFieldSlotsValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return await this.scheduleService.getTrainerDayFieldSlots(
      req['id'],
      params.trainerProfileId,
      params.fieldId,
      params.dayDate,
    );
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        trainerProfileId: {
          type: 'number',
        },
        slotId: {
          type: 'number',
        },
        dayDate: {
          type: 'string',
          // format: 'date-time',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: SessionCardDTO,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('PASSED_DATE').init())
  @ApiTags('Trainer-Schedule: User: Book Session')
  @ApiBearerAuth()
  //
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

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        trainerProfileId: {
          type: 'number',
        },
        childId: {
          type: 'number',
        },
        slotId: {
          type: 'number',
        },
        dayDate: {
          type: 'string',
          // format: 'date-time',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: SessionCardDTO,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('PASSED_DATE').init())
  @ApiTags('Trainer-Schedule: User: Book Session For Child')
  @ApiBearerAuth()
  //
  @Post('/book-session-child')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async bookTrainerSessionForChild(
    @Body(new JoiValidation(BookTrainerSessionValidation)) reqBody,
    @UserId() userId: number,
  ) {
    return await this.scheduleService.bookTrainerSessionForChild(
      userId,
      reqBody.childId,
      reqBody.trainerProfileId,
      reqBody.dayDate,
      reqBody.slotId,
    );
  }
}
