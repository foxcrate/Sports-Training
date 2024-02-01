import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RateTrainerDto } from './dtos/rate-trainer.dto';
import { SessionModel } from './session.model';
import { PlayerProfileModel } from 'src/player-profile/player-profile.model';
import { GlobalService } from 'src/global/global.service';
import {
  CANCELED_BY_ENUM,
  HOME_SEARCH_TYPES_ENUM,
  SESSIONS_STATUSES_ENUM,
  SESSION_REQUEST_STATUSES_ENUM,
} from 'src/global/enums';
import { UserSessionDataDto } from './dtos/user-session-data.dto';
import {
  CoachTrainingSessionResultDto,
  DoctorTrainingSessionResultDto,
  FieldTrainingSessionResultDto,
  TrainingSessionResultDto,
} from './dtos/training-session-result.dto';
import { CoachSessionDataDto } from './dtos/coach-session-data.dto';
import * as moment from 'moment-timezone';
import { CancellingReasonDto } from './dtos/cancelling-reason.dto';

@Injectable()
export class SessionService {
  constructor(
    private readonly i18n: I18nService,
    private sessionModel: SessionModel,
    private playerProfileModel: PlayerProfileModel,
    private globalService: GlobalService,
  ) {}

  async playerRateTrainer(userId: number, reqBody: RateTrainerDto): Promise<boolean> {
    // throw an error if playerProfile don't exist
    let thePlayerProfile = await this.playerProfileModel.getOneByUserId(userId);
    if (!thePlayerProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.PLAYER_PROFILE_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    // throw error if session don't exist
    let theSession = await this.sessionModel.getBookedSessionBySessionId(
      reqBody.sessionId,
    );

    this.validatePlayerRatingSession(thePlayerProfile.userId, theSession.userId);
    await this.sessionModel.savePlayerTrainerRating(
      thePlayerProfile.userId,
      theSession.trainerProfileId,
      reqBody.ratingNumber,
      reqBody.feedback,
    );
    return true;
  }

  async getTrainingSession(
    userId: number,
    sessionId: number,
    type: HOME_SEARCH_TYPES_ENUM,
  ): Promise<TrainingSessionResultDto> {
    switch (type) {
      case HOME_SEARCH_TYPES_ENUM.COACHES:
        const coachSession = await this.sessionModel.getCoachTrainingSession(sessionId);
        const validCoachSession = this.validateSessionExistence(coachSession);
        this.validateSessionViewUserRights(userId, validCoachSession.userId);
        return this.formatCoachTrainingSession(validCoachSession);
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        const doctorSession = await this.sessionModel.getDoctorTrainingSession(sessionId);
        const validDoctorSession = this.validateSessionExistence(doctorSession);
        this.validateSessionViewUserRights(userId, validDoctorSession.userId);
        return this.formatDoctorTrainingSession(validDoctorSession);
      case HOME_SEARCH_TYPES_ENUM.FIELDS:
        const fieldSession = await this.sessionModel.getFieldTrainingSession(sessionId);
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
    const coachSession = await this.sessionModel.getCoachingSession(sessionId);
    const validCoachSession = this.validateSessionExistence(coachSession);
    this.validateSessionViewUserRights(userId, validCoachSession.coachUserId);
    return this.formatCoachTrainingSession(validCoachSession);
  }

  async getCancellingReasons(): Promise<CancellingReasonDto[]> {
    const cancellingReasons = await this.sessionModel.getCancellingReasons();
    return this.formatCancellingReasons(cancellingReasons);
  }

  async coachApproveSession(
    userId: number,
    sessionId: number,
  ): Promise<TrainingSessionResultDto> {
    const coachSessionData: CoachSessionDataDto[] =
      (await this.sessionModel.getCoachSessionData(sessionId)) as CoachSessionDataDto[];
    const validCoachSession = this.validateSession(userId, coachSessionData);
    const { sessionRequestId, coachBookedSessionId } = validCoachSession;
    const [formattedSession] = await Promise.all([
      this.getCoachingSession(userId, sessionId),
      this.sessionModel.updateCoachSessionStatus(
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
      this.sessionModel.getCoachSessionData(sessionId),
      this.sessionModel.getCancellingReason(cancelReasonId),
    ]);
    const [validCoachSession, validCancellingReason] = [
      this.validateSession(userId, coachSessionData),
      this.validateCancellingReasonExistence(cancelReasonData),
    ];
    const { sessionRequestId, coachBookedSessionId } = validCoachSession;
    const [formattedSession] = await Promise.all([
      this.getCoachingSession(userId, sessionId),
      this.sessionModel.updateSetReasonCoachSessionStatus(
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
      await this.sessionModel.getUserSessionData(sessionId);
    const validSession = this.validateUserSession(userId, sessionData);
    const { sessionRequestId, bookedSessionId } = validSession;
    const [formattedSession] = await Promise.all([
      this.getCoachingSession(userId, sessionId),
      this.sessionModel.updateCoachSessionStatus(
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

  // async markSessionAsComplete(theDateTime: string) {}

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
    if (foundSession.bookedSessionStatus == SESSIONS_STATUSES_ENUM.NOT_ACTIVE) {
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
    if (foundSession.bookedSessionStatus == SESSIONS_STATUSES_ENUM.NOT_ACTIVE) {
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

  formatCancellingReasons(cancellingReasons) {
    return (cancellingReasons || []).map((reason) => ({
      id: reason.id,
      name: reason.name,
    }));
  }

  private validatePlayerRatingSession(userId: number, sessionUserID: number): boolean {
    //check if this session is done by this trainer
    if (sessionUserID != userId) {
      throw new BadRequestException(
        this.i18n.t(`errors.WRONG_TRAINER_SESSION_MIX`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return true;
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
}
