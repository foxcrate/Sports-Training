import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { SessionsModel } from './sessions.model';
import {
  CANCELED_BY_ENUM,
  HOME_SEARCH_TYPES_ENUM,
  SESSIONS_STATUSES_ENUM,
  SESSION_REQUEST_STATUSES_ENUM,
} from 'src/global/enums';
import { I18nContext, I18nService } from 'nestjs-i18n';
import * as moment from 'moment-timezone';
import {
  CoachTrainingSessionResultDto,
  DoctorTrainingSessionResultDto,
  FieldTrainingSessionResultDto,
  TrainingSessionResultDto,
} from './dto/training-session-result.dto';
import { CoachSessionDataDto } from './dto/coach-session-data.dto';
import { CancellingReasonDto } from './dto/cancelling-reason.dto';
import { UserSessionDataDto } from './dto/user-session-data.dto';

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

  validateCancellingReasonExistence(cancellingReason): CancellingReasonDto {
    if (!(Array.isArray(cancellingReason) && cancellingReason.length === 1)) {
      throw new NotFoundException(
        this.i18n.t(`errors.NOT_FOUND_CANCELLING_REASON`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return cancellingReason[0];
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

  formatCancellingReasons(cancellingReasons) {
    return (cancellingReasons || []).map((reason) => ({
      id: reason.id,
      name: reason.name,
    }));
  }

  async getCancellingReasons(): Promise<CancellingReasonDto[]> {
    const cancellingReasons = await this.sessionsModel.getCancellingReasons();
    return this.formatCancellingReasons(cancellingReasons);
  }

  validateSession(userId, sessionData) {
    const foundSession = this.validateSessionExistence(sessionData);
    this.validateSessionViewUserRights(userId, foundSession.coachUserId);
    if (!foundSession.sessionRequestId) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_FOUND_SESSION_REQUEST`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    if (foundSession.bookedSessionStatus !== SESSIONS_STATUSES_ENUM.NOT_ACTIVE) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_ALLOWED_BOOKED_SESSION_STATUS`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    if (foundSession.sessionRequestStatus !== SESSION_REQUEST_STATUSES_ENUM.PENDING) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_ALLOWED_TO_CHANGE_STATUS`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return foundSession;
  }

  validateUserSession(userId, sessionData) {
    const foundSession: UserSessionDataDto = this.validateSessionExistence(sessionData);
    this.validateSessionViewUserRights(userId, foundSession.userId);
    if (!foundSession.sessionRequestId) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_FOUND_SESSION_REQUEST`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    if (foundSession.bookedSessionStatus !== SESSIONS_STATUSES_ENUM.NOT_ACTIVE) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_ALLOWED_BOOKED_SESSION_STATUS`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    if (foundSession.sessionRequestStatus !== SESSION_REQUEST_STATUSES_ENUM.PENDING) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_ALLOWED_TO_CHANGE_STATUS`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    const currentDateTime = moment().utc();
    const dateMoment = moment(foundSession.date, 'YYYY-MM-DD');
    const timeMoment = moment(foundSession.fromTime, 'HH:mm:ssZ');

    // Combine date and time
    const combinedDateTime = dateMoment.set({
      hour: timeMoment.hours(),
      minute: timeMoment.minutes(),
      second: timeMoment.seconds(),
      millisecond: timeMoment.milliseconds(),
    });
    const dateTimeAfterSubHours = combinedDateTime.subtract(
      parseInt(`${foundSession.cancellationHours || 1}`, 10),
      'hours',
    );
    if (dateTimeAfterSubHours.isBefore(currentDateTime)) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_ALLOWED_TO_CANCEL_SESSION`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return foundSession;
  }

  async coachApproveSession(
    userId: number,
    sessionId: number,
  ): Promise<TrainingSessionResultDto> {
    const coachSessionData: CoachSessionDataDto[] =
      (await this.sessionsModel.getCoachSessionData(sessionId)) as CoachSessionDataDto[];
    const validCoachSession = this.validateSession(userId, coachSessionData);
    const { sessionRequestId, coachBookedSessionId } = validCoachSession;
    const [formattedSession] = await Promise.all([
      this.getCoachingSession(userId, sessionId),
      this.sessionsModel.updateCoachSessionStatus(
        coachBookedSessionId,
        SESSIONS_STATUSES_ENUM.ACTIVE,
        sessionRequestId,
        SESSION_REQUEST_STATUSES_ENUM.ACCEPTED,
      ),
    ]);
    return {
      ...formattedSession,
      status: SESSION_REQUEST_STATUSES_ENUM.ACCEPTED,
    };
  }

  async coachCancelSession(
    userId: number,
    sessionId: number,
    cancelReasonId: number,
  ): Promise<TrainingSessionResultDto> {
    const [coachSessionData, cancelReasonData] = await Promise.all([
      this.sessionsModel.getCoachSessionData(sessionId),
      this.sessionsModel.getCancellingReason(cancelReasonId),
    ]);
    const [validCoachSession, validCancellingReason] = [
      this.validateSession(userId, coachSessionData),
      this.validateCancellingReasonExistence(cancelReasonData),
    ];
    const { sessionRequestId, coachBookedSessionId } = validCoachSession;
    const [formattedSession] = await Promise.all([
      this.getCoachingSession(userId, sessionId),
      this.sessionsModel.updateSetReasonCoachSessionStatus(
        coachBookedSessionId,
        SESSIONS_STATUSES_ENUM.NOT_ACTIVE,
        sessionRequestId,
        SESSION_REQUEST_STATUSES_ENUM.CANCELED,
        validCancellingReason.id,
        CANCELED_BY_ENUM.TRAINER,
      ),
    ]);
    return {
      ...formattedSession,
      status: SESSION_REQUEST_STATUSES_ENUM.CANCELED,
    };
  }

  async userCancelSession(
    userId: number,
    sessionId: number,
  ): Promise<TrainingSessionResultDto> {
    const sessionData: UserSessionDataDto[] =
      await this.sessionsModel.getUserSessionData(sessionId);
    const validSession = this.validateUserSession(userId, sessionData);
    const { sessionRequestId, bookedSessionId } = validSession;
    const [formattedSession] = await Promise.all([
      this.getCoachingSession(userId, sessionId),
      this.sessionsModel.updateCoachSessionStatus(
        bookedSessionId,
        SESSIONS_STATUSES_ENUM.NOT_ACTIVE,
        sessionRequestId,
        SESSION_REQUEST_STATUSES_ENUM.CANCELED,
        CANCELED_BY_ENUM.PLAYER,
      ),
    ]);
    return {
      ...formattedSession,
      status: SESSION_REQUEST_STATUSES_ENUM.CANCELED,
    };
  }
}
