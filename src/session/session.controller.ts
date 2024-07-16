import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { UserId } from 'src/decorators/user-id.decorator';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { RateTrainerValidation } from './validations/rate-trainer.validation';
import { RateTrainerDto } from './dtos/rate-trainer.dto';
import { SessionService } from './session.service';
import { CancellingReasonDto } from './dtos/cancelling-reason.dto';
import {
  TrainingSessionResult,
  TrainingSessionResultDto,
} from './dtos/training-session-result.dto';
import { TrainingSessionParamsDto } from './dtos/training-session-params.dto';
import { SessionIdParamValidations } from './validations/session-id.validations';
import { CoachDeclineSessionDto } from './dtos/coach-decline-session.dto.ts';
import { CoachDeclineSessionValidations } from './validations/coach-decline-session.validations';
import { SessionTypeValidations } from './validations/session-type.validations';
import { RequestSlotChangeValidation } from './validations/request-slot-change.validation';
import { RequestSlotChangeDto } from './dtos/request-slot-change.dto';
import { SessionRequestIdValidations } from './validations/session-request-id.validation';
import { SessionRequestIdDto } from './dtos/session-request-id.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { PendingSessionDTO } from './dtos/pending-session.dto';

// @Roles(AvailableRoles.User)
// @UseGuards(AuthGuard, RoleGuard)
// @Controller({ path: 'session', version: '1' })
@Controller('session')
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @ApiBody({
    type: RateTrainerDto,
  })
  @ApiCreatedResponse({
    type: Boolean,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('PLAYER_PROFILE_NOT_FOUND').init())
  @ApiTags('Session: Rate Trainer')
  @ApiBearerAuth()
  //
  @Post('rate-trainer')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async rateSession1(
    @Body(new JoiValidation(RateTrainerValidation)) reqBody: RateTrainerDto,
    @UserId() userId: number,
  ) {
    return await this.sessionService.playerRateTrainer(userId, reqBody);
  }

  @ApiBody({
    type: RateTrainerDto,
  })
  @ApiCreatedResponse({
    type: Boolean,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('PLAYER_PROFILE_NOT_FOUND').init())
  @ApiTags('Session: Rate Player')
  @ApiBearerAuth()
  //
  @Post('rate-player')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async rateSession2(
    @Body(new JoiValidation(RateTrainerValidation)) reqBody: RateTrainerDto,
    @UserId() userId: number,
  ) {
    return await this.sessionService.trainerRatePlayer(userId, reqBody);
  }

  @ApiParam({
    name: 'sessionId',
  })
  @ApiBody({
    type: RequestSlotChangeDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('NOT_ALLOWED_USER_SESSION').init())
  @ApiTags('Session: Player Request Slot Change')
  @ApiBearerAuth()
  //
  @Post('player-request-slot-change/:sessionId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async playerRequestSlotChange1(
    @Param(new JoiValidation(SessionIdParamValidations)) params,
    @Body(new JoiValidation(RequestSlotChangeValidation)) reqBody: RequestSlotChangeDto,
    @UserId() userId: number,
  ) {
    return await this.sessionService.playerRequestSlotChange(
      userId,
      params.sessionId,
      reqBody,
    );
  }

  @ApiParam({
    name: 'sessionId',
  })
  @ApiQuery({
    name: 'type',
    enum: ['coaches', 'doctors', 'fields'],
  })
  @ApiCreatedResponse({
    type: TrainingSessionResult,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('WRONG_FILTER_TYPE').init())
  @ApiTags('Session: Get Training Session')
  @ApiBearerAuth()
  //
  @Get('training-session/:sessionId')
  @Version('1')
  @Roles('user', 'child')
  @UseGuards(AuthGuard, RoleGuard)
  async getTrainingSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @Query(new JoiValidation(SessionTypeValidations)) { type },
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionService.getTrainingSession(userId, sessionId, type);
  }

  @ApiCreatedResponse({
    type: PendingSessionDTO,
    isArray: true,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('TRAINER_PROFILE_NOT_FOUND').init())
  @ApiTags('Session: Get Pending Sessions')
  @ApiBearerAuth()
  //
  @Get('get-pending-sessions')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getPendingSessions1(@UserId() userId: number) {
    return await this.sessionService.getPendingSessions(userId);
  }

  @ApiParam({
    name: 'sessionId',
  })
  @ApiCreatedResponse({
    type: TrainingSessionResult,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('NOT_FOUND_SESSION').init())
  @ApiTags('Session: Get Coaching Session')
  @ApiBearerAuth()
  //
  @Get('coaching-session/:sessionId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getCoachingSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionService.getCoachingSession(userId, sessionId);
  }

  @ApiParam({
    name: 'sessionRequestId',
  })
  @ApiCreatedResponse({
    type: TrainingSessionResult,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('BOOKED_SLOT').init())
  @ApiTags('Session: Coach Approve Request')
  @ApiBearerAuth()
  //
  @Put('coach-approve-session-request/:sessionRequestId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async coachApproveSession(
    @Param(new JoiValidation(SessionRequestIdValidations))
    { sessionRequestId }: SessionRequestIdDto,
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionService.coachApproveRequest(userId, sessionRequestId);
  }

  @ApiParam({
    name: 'sessionRequestId',
  })
  @ApiBody({
    type: CoachDeclineSessionDto,
  })
  @ApiCreatedResponse({
    type: TrainingSessionResult,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('NOT_FOUND_DECLINE_REASON').init())
  @ApiTags('Session: Coach Decline Request')
  @ApiBearerAuth()
  //
  @Put('coach-decline-session-request/:sessionRequestId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async coachDeclineSession(
    @Param(new JoiValidation(SessionRequestIdValidations))
    { sessionRequestId }: SessionRequestIdDto,
    @UserId() userId: number,
    @Body(new JoiValidation(CoachDeclineSessionValidations))
    { declineReasonId }: CoachDeclineSessionDto,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionService.coachDeclineRequest(
      userId,
      sessionRequestId,
      declineReasonId,
    );
  }

  // @Put('coach-cancel-session/:sessionId')
  // @Version('1')
  // @Roles('user')
  // @UseGuards(AuthGuard, RoleGuard)
  // async coachCancelSession(
  //   @Param(new JoiValidation(SessionIdParamValidations))
  //   { sessionId }: TrainingSessionParamsDto,
  //   @UserId() userId: number,
  // ): Promise<TrainingSessionResultDto> {
  //   return this.sessionService.coachCancelSession(userId, sessionId);
  // }

  @ApiParam({
    name: 'sessionId',
  })
  @ApiCreatedResponse({
    type: TrainingSessionResult,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('BOOKED_SESSION_NOT_FOUND').init())
  @ApiTags('Session: User Cancel Session')
  @ApiBearerAuth()
  //
  @Put('user-cancel-session/:sessionId')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async userCancelSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionService.userCancelSession(userId, sessionId);
  }

  @ApiCreatedResponse({
    type: CancellingReasonDto,
    isArray: true,
  })
  @ApiTags('Session: Get Canceling Reasons')
  @ApiBearerAuth()
  //
  @Get('cancelling-reasons')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getCancellingReasons(): Promise<CancellingReasonDto[]> {
    return this.sessionService.getCancellingReasons();
  }
}
