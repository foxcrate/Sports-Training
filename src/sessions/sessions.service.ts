import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { SessionsModel } from './sessions.model';
import { HOME_SEARCH_TYPES_ENUM } from 'src/global/enums';
import { I18nContext, I18nService } from 'nestjs-i18n';
import * as moment from 'moment-timezone';
import {
  CoachTrainingSessionResultDto,
  DoctorTrainingSessionResultDto,
  FieldTrainingSessionResultDto,
  TrainingSessionResultDto,
} from './dto/training-session-result.dto';

@Injectable()
export class SessionsService {
  constructor(
    private sessionsModel: SessionsModel,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
  ) {}

  formatTrainingSession(trainingSession) {
    return trainingSession;
  }

  private formatDateStartEndTime(bookedDateTime, slotDuration) {
    const dateStartEndTime = {
      startTime: null,
      endTime: null,
      sessionDate: null,
    };
    dateStartEndTime.startTime = this.globalService.getLocalTime12(
      moment.utc(bookedDateTime),
    );
    dateStartEndTime.endTime = this.globalService.getLocalTime12(
      moment
        .utc(bookedDateTime)
        .clone()
        .add(parseInt(slotDuration || 60, 10), 'minutes'),
    );
    dateStartEndTime.sessionDate = moment(bookedDateTime).format('YYYY-MM-DD');
    return dateStartEndTime;
  }

  private formatDoctorTrainingSession(trainingSession): DoctorTrainingSessionResultDto {
    const {
      slotDuration,
      gmt,
      doctorBookedHoursId,
      bookedDateTime,
      userId,
      ...restTrainingSession
    } = trainingSession;

    return {
      sessionId: doctorBookedHoursId,
      ...this.formatDateStartEndTime(bookedDateTime, slotDuration),
      ...restTrainingSession,
    };
  }

  private formatCoachTrainingSession(trainingSession): CoachTrainingSessionResultDto {
    const {
      gmt,
      coachBookedSessionId,
      bookedDate,
      userId,
      sports,
      fromTime,
      toTime,
      coachUserId,
      ...restTrainingSession
    } = trainingSession;
    let resultingSports = sports && this.globalService.safeParse(sports);
    if (Array.isArray(resultingSports) && resultingSports.length) {
      resultingSports = [...new Set(resultingSports.filter((sport) => sport))];
    }
    const startTime = this.globalService.getLocalTime12(moment.utc(fromTime, 'HH:mmZ'));
    const endTime = this.globalService.getLocalTime12(moment.utc(toTime, 'HH:mmZ'));
    const sessionData = moment(bookedDate).format('YYYY-MM-DD');
    return {
      sessionId: coachBookedSessionId,
      ...restTrainingSession,
      sports: resultingSports,
      startTime,
      endTime,
      sessionData,
    };
  }

  private formatFieldTrainingSession(trainingSession): FieldTrainingSessionResultDto {
    const {
      slotDuration,
      gmt,
      fieldBookedHoursId,
      bookedDateTime,
      userId,
      ...restTrainingSession
    } = trainingSession;

    return {
      sessionId: fieldBookedHoursId,
      ...this.formatDateStartEndTime(bookedDateTime, slotDuration),
      ...restTrainingSession,
    };
  }

  validateSessionExistence(sessionData) {
    if (!(Array.isArray(sessionData) && sessionData.length === 1)) {
      throw new NotFoundException(
        this.i18n.t(`errors.NOT_FOUND_SESSION`, { lang: I18nContext.current().lang }),
      );
    }
    return sessionData[0];
  }

  validateSessionViewUserRights(userId, toBeValidatedId) {
    if (Number(toBeValidatedId) !== Number(userId)) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_ALLOWED_USER_SESSION`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
  }

  async getTrainingSession(
    userId: number,
    sessionId: number,
    type: HOME_SEARCH_TYPES_ENUM,
  ): Promise<TrainingSessionResultDto> {
    switch (type) {
      case HOME_SEARCH_TYPES_ENUM.COACHES:
        const coachSession = await this.sessionsModel.getCoachTrainingSession(sessionId);
        const validCoachSession = this.validateSessionExistence(coachSession);
        this.validateSessionViewUserRights(userId, validCoachSession.userId);
        return this.formatCoachTrainingSession(validCoachSession);
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        const doctorSession =
          await this.sessionsModel.getDoctorTrainingSession(sessionId);
        const validDoctorSession = this.validateSessionExistence(doctorSession);
        this.validateSessionViewUserRights(userId, validDoctorSession.userId);
        return this.formatDoctorTrainingSession(validDoctorSession);
      case HOME_SEARCH_TYPES_ENUM.FIELDS:
        const fieldSession = await this.sessionsModel.getFieldTrainingSession(sessionId);
        const validFieldSession = this.validateSessionExistence(fieldSession);
        this.validateSessionViewUserRights(userId, validFieldSession.userId);
        return this.formatFieldTrainingSession(validFieldSession);
      default:
        throw new BadRequestException(
          this.i18n.t(`errors.WRONG_FILTER_TYPE`, { lang: I18nContext.current().lang }),
        );
    }
  }

  async getCoachingSession(
    userId: number,
    sessionId: number,
  ): Promise<TrainingSessionResultDto> {
    const coachSession = await this.sessionsModel.getCoachingSession(sessionId);
    const validCoachSession = this.validateSessionExistence(coachSession);
    this.validateSessionViewUserRights(userId, validCoachSession.coachUserId);
    return this.formatCoachTrainingSession(validCoachSession);
  }
}
