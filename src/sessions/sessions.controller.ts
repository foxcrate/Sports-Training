import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { SessionsService } from './sessions.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { UserId } from 'src/decorators/user-id.decorator';
import { SessionIdParamValidations } from './validations/session-id.validations';
import { SessionTypeValidations } from './validations/session-type.validations';
import { TrainingSessionParamsDto } from './dto/training-session-params.dto';
import { TrainingSessionResultDto } from './dto/training-session-result.dto';
import { CancellingReasonDto } from './dto/cancelling-reason.dto';
import { CoachCancelSessionDto } from './dto/coach-cancel-session.dto.ts';
import { CoachCancelSessionValidations } from './validations/coach-cancel-session.validations';

@Roles(AvailableRoles.User)
@UseGuards(AuthGuard, RoleGuard)
@Controller({ path: 'sessions', version: '1' })
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get('training-session/:sessionId')
  async getTrainingSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @Query(new JoiValidation(SessionTypeValidations)) { type },
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionsService.getTrainingSession(userId, sessionId, type);
  }

  @Get('coaching-session/:sessionId')
  async getCoachingSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionsService.getCoachingSession(userId, sessionId);
  }

  @Put('coach-approve-session/:sessionId')
  async coachApproveSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionsService.coachApproveSession(userId, sessionId);
  }

  @Put('coach-cancel-session/:sessionId')
  async coachCancelSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @Body(new JoiValidation(CoachCancelSessionValidations))
    { cancelReasonId }: CoachCancelSessionDto,
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionsService.coachCancelSession(userId, sessionId, cancelReasonId);
  }

  @Put('user-cancel-session/:sessionId')
  async userCancelSession(
    @Param(new JoiValidation(SessionIdParamValidations))
    { sessionId }: TrainingSessionParamsDto,
    @UserId() userId: number,
  ): Promise<TrainingSessionResultDto> {
    return this.sessionsService.userCancelSession(userId, sessionId);
  }

  @Get('cancelling-reasons')
  async getCancellingReasons(): Promise<CancellingReasonDto[]> {
    return this.sessionsService.getCancellingReasons();
  }
}
