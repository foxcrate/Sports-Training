import { BadRequestException, Injectable } from '@nestjs/common';
import { CalendarModel } from './calendar.model';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { DatesCountResultDto } from './dto/dates-count-result.dto';
import * as moment from 'moment-timezone';
import { DateSessionsResultDto } from './dto/date-sessions-result.dto';
import { DatesCountTypeFilter } from './dto/dates-count-filters.dto';
import { HOME_SEARCH_TYPES_ENUM } from 'src/global/enums';

@Injectable()
export class CalendarService {
  private readonly toBeAddedMonths = 3;

  constructor(
    private calendarModel: CalendarModel,
    private readonly i18n: I18nService,
    private globalService: GlobalService,
  ) {}

  private formateDatesCountResults(results): DatesCountResultDto[] {
    return (results || []).map((result) => ({
      ...result,
      bookingDate: result.bookingDate
        ? moment(result.bookingDate).format('YYYY-MM-DD')
        : null,
      bookedHoursCount: parseInt(result.bookedHoursCount || 0),
    }));
  }

  private formateDateSessionsResults(results): DateSessionsResultDto {
    return (results || []).map(({ gmt, ...result }) => ({
      ...result,
      sports: result.sports && this.globalService.safeParse(result.sports),
      startTime: this.globalService.getLocalTime12(moment.utc(result.bookedHour)),
    }));
  }

  async getDatesCount(
    userId: number,
    type: DatesCountTypeFilter,
  ): Promise<DatesCountResultDto[]> {
    const startDate = moment().clone().format('YYYY-MM-DD');
    const endDate = moment()
      .clone()
      .add(this.toBeAddedMonths, 'months')
      .format('YYYY-MM-DD');
    let results = null;
    switch (type) {
      case HOME_SEARCH_TYPES_ENUM.COACHES:
        results = await this.calendarModel.getCoachesDatesCount(
          userId,
          startDate,
          endDate,
        );
        break;
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        results = await this.calendarModel.getDoctorClinicDatesCount(
          userId,
          startDate,
          endDate,
        );
        break;
      case HOME_SEARCH_TYPES_ENUM.FIELDS:
        results = await this.calendarModel.getFieldsDatesCount(
          userId,
          startDate,
          endDate,
        );
        break;
      default:
        throw new BadRequestException(
          this.i18n.t(`errors.WRONG_FILTER_TYPE`, { lang: I18nContext.current().lang }),
        );
    }
    return this.formateDatesCountResults(results);
  }

  async getDateSessions(
    userId: number,
    type: DatesCountTypeFilter,
    date: string,
  ): Promise<DateSessionsResultDto> {
    if (!this.globalService.isValidDateFormat(date)) {
      throw new BadRequestException(
        this.i18n.t(`errors.WRONG_DATE_FORMAT`, { lang: I18nContext.current().lang }),
      );
    }
    let results = null;
    switch (type) {
      case HOME_SEARCH_TYPES_ENUM.COACHES:
        results = await this.calendarModel.getTrainerProfileDateSessions(userId, date);
        break;
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        results = await this.calendarModel.getDoctorClinicDateSessions(userId, date);
        break;
      case HOME_SEARCH_TYPES_ENUM.FIELDS:
        results = await this.calendarModel.getFieldsDateSessions(userId, date);
        break;
      default:
        throw new BadRequestException(
          this.i18n.t(`errors.WRONG_FILTER_TYPE`, { lang: I18nContext.current().lang }),
        );
    }
    return this.formateDateSessionsResults(results);
  }
}
