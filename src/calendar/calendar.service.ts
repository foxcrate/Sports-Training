import { BadRequestException, Injectable } from '@nestjs/common';
import { CalendarRepository } from './calendar.repository';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { DatesCountResultDto } from './dto/dates-count-result.dto';
import moment from 'moment-timezone';
import { DateSessionsResultDto } from './dto/date-sessions-result.dto';
import { DatesCountTypeFilter } from './dto/dates-count-filters.dto';
import { CALENDAR_TYPES_ENUM } from './dto/calendar-types.enum';
import { SESSIONS_STATUSES_ENUM } from 'src/global/enums';

@Injectable()
export class CalendarService {
  private readonly toBeAddedMonths = 3;
  private DEFAULT_LIMIT_MULTI_RESULTS = 100;

  constructor(
    private CalendarRepository: CalendarRepository,
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
      if (result.type === CALENDAR_TYPES_ENUM.COACHES) {
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
    const results = await this.CalendarRepository.getAllDatesCount(
      userId,
      startDate,
      endDate,
    );
    return this.formateDatesCountResults(results);
  }

  async getDateSessions(
    userId: number,
    type: string,
    date: string,
    pageSize: number,
    status: SESSIONS_STATUSES_ENUM,
    fieldId: number,
  ): Promise<DateSessionsResultDto> {
    console.log('pageSize:', pageSize);

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
      results = await this.CalendarRepository.getMultiDateSessions(
        convertedType,
        userId,
        date,
        pageSize || this.DEFAULT_LIMIT_MULTI_RESULTS,
        status,
        fieldId,
      );
    } else {
      switch (convertedType[0]) {
        case CALENDAR_TYPES_ENUM.PLAYERS:
          results = await this.CalendarRepository.getPlayerDateSessions(
            userId,
            date,
            status,
            fieldId,
          );
          break;
        case CALENDAR_TYPES_ENUM.COACHES:
          results = await this.CalendarRepository.getCoachSessions(
            userId,
            date,
            status,
            fieldId,
          );
          break;
        case CALENDAR_TYPES_ENUM.DOCTORS:
          results = await this.CalendarRepository.getDoctorClinicDateSessions(
            userId,
            date,
          );
          break;
        case CALENDAR_TYPES_ENUM.FIELDS:
          results = await this.CalendarRepository.getFieldsDateSessions(userId, date);
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
