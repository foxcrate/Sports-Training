import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserId } from 'src/decorators/user-id.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { ScheduleService } from './schedule.service';
import { DatesCountFiltersDto } from './dto/dates-count-filters.dto';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { DatesCountFiltersValidation } from './validations/dates-count-filters.validations';
import { DatesCountResultDto } from './dto/dates-count-result.dto';
import { SessionsFiltersValidation } from './validations/sessions-filters.validations';
import { SessionsFiltersDto } from './dto/sessions-filters.dto';
import { DateSessionsResultDto } from './dto/date-sessions-result.dto';

@Roles(AvailableRoles.User)
@UseGuards(AuthGuard, RoleGuard)
@Controller({ path: 'calendar/schedule', version: '1' })
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get('dates-count')
  async getDatesCounts(
    @Query(new JoiValidation(DatesCountFiltersValidation)) filters: DatesCountFiltersDto,
    @UserId() userId: number,
  ): Promise<DatesCountResultDto[]> {
    return this.scheduleService.getDatesCount(userId, filters.type);
  }

  @Get('sessions')
  async getDateSessions(
    @Query(new JoiValidation(SessionsFiltersValidation)) filters: SessionsFiltersDto,
    @UserId() userId: number,
  ): Promise<DateSessionsResultDto> {
    return this.scheduleService.getDateSessions(userId, filters.type, filters.date);
  }
}
