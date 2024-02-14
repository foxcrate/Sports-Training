import { Controller, Get, Query, UseGuards, Version } from '@nestjs/common';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { CalendarService } from './calendar.service';
import { UserId } from 'src/decorators/user-id.decorator';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { DatesCountFiltersValidation } from './validations/dates-count-filters.validations';
import { DatesCountFiltersDto } from './dto/dates-count-filters.dto';
import { DatesCountResultDto } from './dto/dates-count-result.dto';
import { SessionsFiltersValidation } from './validations/sessions-filters.validations';
import { SessionsFiltersDto } from './dto/sessions-filters.dto';
import { DateSessionsResultDto } from './dto/date-sessions-result.dto';

// @Roles(AvailableRoles.User, AvailableRoles.Child)
// @UseGuards(AuthGuard, RoleGuard)
// @Controller({ path: 'calendar', version: '1' })
@Controller('calendar')
export class CalendarController {
  constructor(private calenderService: CalendarService) {}

  @Get('dates-count')
  @Version('1')
  @Roles('user', 'child')
  @UseGuards(AuthGuard, RoleGuard)
  async getDatesCounts(
    @Query(new JoiValidation(DatesCountFiltersValidation)) filters: DatesCountFiltersDto,
    @UserId() userId: number,
  ): Promise<DatesCountResultDto[]> {
    return this.calenderService.getDatesCount(userId, filters?.startDate);
  }

  @Get('date-sessions')
  @Version('1')
  @Roles('user', 'child')
  @UseGuards(AuthGuard, RoleGuard)
  async getDateSessions(
    @Query(new JoiValidation(SessionsFiltersValidation)) filters: SessionsFiltersDto,
    @UserId() userId: number,
  ): Promise<DateSessionsResultDto> {
    return this.calenderService.getDateSessions(
      userId,
      filters.type,
      filters.date,
      parseInt(filters.pageSize || '0', 10),
      filters.status,
      filters.fieldId,
    );
  }
}
