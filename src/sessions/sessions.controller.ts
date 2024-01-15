import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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
}
