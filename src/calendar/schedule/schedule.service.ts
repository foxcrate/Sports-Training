import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ScheduleModel } from './schedule.model';
import * as moment from 'moment-timezone';
import { DatesCountTypeFilter } from './dto/dates-count-filters.dto';
import { HOME_SEARCH_TYPES_ENUM } from 'src/utils/enums';
import { DatesCountResultDto } from './dto/dates-count-result.dto';
import { GlobalService } from 'src/global/global.service';
import { DateSessionsResultDto } from './dto/date-sessions-result.dto';

@Injectable()
export class ScheduleService {
  private readonly toBeAddedMonths = 3;

  constructor(
    private scheduleModel: ScheduleModel,
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
        results = await this.scheduleModel.getCoachesDatesCount(
          userId,
          startDate,
          endDate,
        );
        break;
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        results = await this.scheduleModel.getDoctorClinicDatesCount(
          userId,
          startDate,
          endDate,
        );
        break;
      case HOME_SEARCH_TYPES_ENUM.FIELDS:
        results = await this.scheduleModel.getFieldsDatesCount(
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
        results = await this.scheduleModel.getTrainerProfileDateSessions(userId, date);
        break;
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        results = await this.scheduleModel.getDoctorClinicDateSessions(userId, date);
        break;
      case HOME_SEARCH_TYPES_ENUM.FIELDS:
        results = await this.scheduleModel.getFieldsDateSessions(userId, date);
        break;
      default:
        throw new BadRequestException(
          this.i18n.t(`errors.WRONG_FILTER_TYPE`, { lang: I18nContext.current().lang }),
        );
    }
    return this.formateDateSessionsResults(results);
  }
}
