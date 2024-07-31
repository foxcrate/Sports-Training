import { Controller, Get, Query, UseGuards, Version } from '@nestjs/common';
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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { CALENDAR_TYPES_ENUM } from './dto/calendar-types.enum';
import { SESSIONS_STATUSES_ENUM } from 'src/global/enums';

// @Roles(AvailableRoles.User, AvailableRoles.Child)
// @UseGuards(AuthGuard, RoleGuard)
// @Controller({ path: 'calendar', version: '1' })
@Controller('calendar')
export class CalendarController {
  constructor(private calenderService: CalendarService) {}

  @ApiQuery({
    name: 'type',
    enum: CALENDAR_TYPES_ENUM,
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
  })
  @ApiCreatedResponse({
    type: DatesCountResultDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('WRONG_DATE_FORMAT').init())
  @ApiTags('Calender: Dates Count')
  @ApiBearerAuth()
  //
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

  @ApiQuery({
    name: 'type',
    enum: CALENDAR_TYPES_ENUM,
    required: false,
  })
  @ApiQuery({
    name: 'date',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    enum: SESSIONS_STATUSES_ENUM,
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
  })
  @ApiQuery({
    name: 'fieldId',
    type: Number,
    required: false,
  })
  @ApiCreatedResponse({
    type: DateSessionsResultDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('WRONG_DATE_FORMAT').init())
  @ApiTags('Calender: Dates Sessions')
  @ApiBearerAuth()
  //
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
