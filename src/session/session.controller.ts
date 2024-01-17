import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { UserId } from 'src/decorators/user-id.decorator';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { RateSessionValidation } from './dtos/rate-session.validation';
import { RateSessionDto } from './dtos/rate-session.dto';
import { SessionService } from './session.service';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';
import { CancellingReasonDto } from './dtos/cancelling-reason.dto';
import { TrainingSessionResultDto } from './dtos/training-session-result.dto';
import { TrainingSessionParamsDto } from './dtos/training-session-params.dto';
import { SessionIdParamValidations } from './validations/session-id.validations';
import { CoachCancelSessionDto } from './dtos/coach-cancel-session.dto.ts';
import { CoachCancelSessionValidations } from './validations/coach-cancel-session.validations';
import { SessionTypeValidations } from './validations/session-type.validations';

@Roles(AvailableRoles.User)
@UseGuards(AuthGuard, RoleGuard)
@Controller({ path: 'session', version: '1' })
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @Post('/player-rate')
  async rateSession1(
    @Body(new JoiValidation(RateSessionValidation)) reqBody: RateSessionDto,
    @UserId() userId: number,
  ) {
    return await this.sessionService.playerRateSession(userId, reqBody);
  }

  @Get('training-session/:sessionId')
  async getTrainingSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @Query(new JoiValidation(SessionTypeValidations)) { type },
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionService.getTrainingSession(userId, sessionId, type);
  }

  @Get('coaching-session/:sessionId')
  async getCoachingSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionService.getCoachingSession(userId, sessionId);
  }

  @Put('coach-approve-session/:sessionId')
  async coachApproveSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionService.coachApproveSession(userId, sessionId);
  }

  @Put('coach-cancel-session/:sessionId')
  async coachCancelSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @Body(new JoiValidation(CoachCancelSessionValidations))
    { cancelReasonId }: CoachCancelSessionDto,
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionService.coachCancelSession(userId, sessionId, cancelReasonId);
  }

  @Put('user-cancel-session/:sessionId')
  async userCancelSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionService.userCancelSession(userId, sessionId);
  }

  @Get('cancelling-reasons')
  async getCancellingReasons(): Promise<CancellingReasonDto[]> {
    return this.sessionService.getCancellingReasons();
  }
}
