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
  private DEFAULT_LIMIT_MULTI_RESULTS = 10;

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
    return (results || []).map(({ gmt, slotDuration, fromTime, toTime, ...result }) => {
      let sports = result.sports && this.globalService.safeParse(result.sports);
      if (Array.isArray(sports) && sports.length) {
        sports = [...new Set(sports.filter((sport) => sport))];
      }
      const startEndTime = {
        startTime: null,
        endTime: null,
      };
      if (result.type === HOME_SEARCH_TYPES_ENUM.COACHES) {
        startEndTime.startTime = this.globalService.getLocalTime12(
          moment.utc(fromTime, 'HH:mmZ'),
        );
        startEndTime.endTime = this.globalService.getLocalTime12(
          moment.utc(toTime, 'HH:mmZ'),
        );
      } else {
        startEndTime.startTime = this.globalService.getLocalTime12(
          moment.utc(result.bookedHour),
        );
        startEndTime.endTime = this.globalService.getLocalTime12(
          moment
            .utc(result.bookedHour)
            .clone()
            .add(parseInt(slotDuration || 60, 10), 'minutes'),
        );
      }
      return {
        ...result,
        ...startEndTime,
        sports,
      };
    });
  }

  async getDatesCount(
    userId: number,
    reqStartDate: string | undefined = undefined,
  ): Promise<DatesCountResultDto[]> {
    if (reqStartDate && !this.globalService.isValidDateFormat(reqStartDate)) {
      throw new BadRequestException(
        this.i18n.t(`errors.WRONG_DATE_FORMAT`, { lang: I18nContext.current().lang }),
      );
    }
    const startDate = reqStartDate ?? moment().clone().format('YYYY-MM-DD');
    const endDate = moment(startDate)
      .clone()
      .add(this.toBeAddedMonths, 'months')
      .format('YYYY-MM-DD');
    const results = await this.calendarModel.getAllDatesCount(userId, startDate, endDate);
    return this.formateDatesCountResults(results);
  }

  async getDateSessions(
    userId: number,
    type: string,
    date: string,
    pageSize: number,
  ): Promise<DateSessionsResultDto> {
    if (date && !this.globalService.isValidDateFormat(date)) {
      throw new BadRequestException(
        this.i18n.t(`errors.WRONG_DATE_FORMAT`, { lang: I18nContext.current().lang }),
      );
    }
    let results = null;
    const convertedType: DatesCountTypeFilter[] | undefined = type
      ?.split(',')
      .map((type) => type.trim()) as DatesCountTypeFilter[];
    if (!convertedType || convertedType.length !== 1) {
      results = await this.calendarModel.getMultiDateSessions(
        convertedType,
        userId,
        date,
        pageSize || this.DEFAULT_LIMIT_MULTI_RESULTS,
      );
    } else {
      switch (convertedType[0]) {
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
    }
    return this.formateDateSessionsResults(results);
  }
}
