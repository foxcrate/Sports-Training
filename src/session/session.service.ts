import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RateTrainerDto } from './dtos/rate-trainer.dto';
import { SessionModel } from './session.model';
import { PlayerProfileModel } from 'src/player-profile/player-profile.model';
import { GlobalService } from 'src/global/global.service';
import {
  CANCELED_BY_ENUM,
  HOME_SEARCH_TYPES_ENUM,
  NOTIFICATION_ABOUT,
  NOTIFICATION_SENT_TO,
  NOTIFICATION_TYPE,
  SESSIONS_STATUSES_ENUM,
  SESSION_REQUEST_STATUSES_ENUM,
  SESSION_REQUEST_TYPE,
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
import { TrainerScheduleService } from 'src/trainer-schedule/trainer-schedule.service';
import { TrainerProfileModel } from 'src/trainer-profile/trainer-profile.model';
import { NotificationModel } from 'src/notification/notification.model';
import { RequestSlotChangeDto } from './dtos/request-slot-change.dto';
import { TrainerScheduleModel } from 'src/trainer-schedule/trainer-schedule.model';

@Injectable()
export class SessionService {
  constructor(
    private readonly i18n: I18nService,
    private sessionModel: SessionModel,
    private playerProfileModel: PlayerProfileModel,
    private trainerProfileModel: TrainerProfileModel,
    private notificationModel: NotificationModel,
    private trainerScheduleService: TrainerScheduleService,
    private trainerScheduleModel: TrainerScheduleModel,
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
    // console.log({ coachSession });

    const validCoachSession = this.validateSessionExistence(coachSession);
    this.validateSessionViewUserRights(userId, validCoachSession.coachUserId);
    return this.formatCoachTrainingSession(validCoachSession);
  }

  async getCancellingReasons(): Promise<CancellingReasonDto[]> {
    const cancellingReasons = await this.sessionModel.getCancellingReasons();
    return this.formatCancellingReasons(cancellingReasons);
  }

  async getPendingSessions(userId: number) {
    let trainerProfile = await this.trainerProfileModel.getByUserId(userId);
    return await this.sessionModel.getPendingSessions(trainerProfile.id);
  }

  async playerRequestSlotChange(
    userId: number,
    sessionId: number,
    reqBody: RequestSlotChangeDto,
  ) {
    await this.playerProfileModel.getOneByUserId(userId);
    await this.validateRequestChangeSlot(
      userId,
      sessionId,
      reqBody.newSlotId,
      reqBody.newDate,
    );
    await this.sessionModel.createChangeSessionSlotRequest(
      sessionId,
      reqBody.newDate,
      reqBody.newSlotId,
    );
  }

  async validateRequestChangeSlot(
    userId: number,
    sessionId: number,
    newSlotId: number,
    newDate: string,
  ) {
    let bookedSession = await this.sessionModel.getBookedSessionBySessionId(sessionId);
    if (bookedSession.userId !== userId) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_ALLOWED_USER_SESSION`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    //validate slot existance
    await this.trainerScheduleModel.getSlotById(newSlotId);

    //validate if there is a booked session
    if (
      await this.trainerScheduleService.checkBookedSlot(
        newSlotId,
        newDate,
        null,
        SESSIONS_STATUSES_ENUM.ACTIVE,
      )
    ) {
      throw new BadRequestException(
        this.i18n.t(`errors.BOOKED_SLOT`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
  }

  async coachApproveRequest(
    userId: number,
    sessionRequestId: number,
  ): Promise<TrainingSessionResultDto> {
    let sessionRequest = await this.sessionModel.getSessionRequestByid(sessionRequestId);
    if (sessionRequest.type === SESSION_REQUEST_TYPE.NEW) {
      return await this.coachApproveNewSession(
        userId,
        sessionRequest.trainerBookedSessionId,
      );
    } else if (sessionRequest.type === SESSION_REQUEST_TYPE.CHANGE) {
      return await this.coachApproveChangeSessionSlot(
        userId,
        sessionRequest.trainerBookedSessionId,
        sessionRequest.newSlotId,
        sessionRequest.newSessionDate,
      );
    }
  }

  async coachDeclineRequest(
    userId: number,
    sessionRequestId: number,
  ): Promise<TrainingSessionResultDto> {
    let sessionRequest = await this.sessionModel.getSessionRequestByid(sessionRequestId);
    if (sessionRequest.type === SESSION_REQUEST_TYPE.NEW) {
      return await this.coachDeclineNewSession(
        userId,
        sessionRequest.trainerBookedSessionId,
      );
    } else if (sessionRequest.type === SESSION_REQUEST_TYPE.CHANGE) {
      return await this.coachDeclineChangeSessionSlot(
        userId,
        sessionRequest.trainerBookedSessionId,
      );
    }
  }

  async coachApproveNewSession(
    userId: number,
    sessionId: number,
  ): Promise<TrainingSessionResultDto> {
    const coachSessionData: CoachSessionDataDto[] =
      (await this.sessionModel.getCoachSessionData(sessionId)) as CoachSessionDataDto[];

    // console.log({ coachSessionData });

    const validCoachSession = await this.validateChangeSessionRequest(
      userId,
      coachSessionData,
    );

    //validate if there is a booked session
    if (
      await this.trainerScheduleService.checkBookedSlot(
        coachSessionData[0].slotId,
        coachSessionData[0].date,
        null,
        SESSIONS_STATUSES_ENUM.ACTIVE,
      )
    ) {
      throw new BadRequestException(
        this.i18n.t(`errors.BOOKED_SLOT`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    const { sessionRequestId, coachBookedSessionId } = validCoachSession;
    const [formattedSession] = await Promise.all([
      this.getCoachingSession(userId, sessionId),
      this.sessionModel.updateSessionAndRequest(
        coachBookedSessionId,
        SESSIONS_STATUSES_ENUM.ACTIVE,
        sessionRequestId,
        SESSION_REQUEST_STATUSES_ENUM.ACCEPTED,
      ),
    ]);
    // await this.sessionModel.rejectRestOfSameDateSlotRequests(
    //   coachSessionData[0].date,
    //   coachSessionData[0].slotId,
    // );
    await this.rejectRestOfSameDateSlotRequests(
      coachSessionData[0].date,
      coachSessionData[0].slotId,
    );

    // create notification
    await this.notificationModel.createOne(
      coachSessionData[0].userId,
      coachSessionData[0].coachBookedSessionId,
      NOTIFICATION_SENT_TO.PLAYER_PROFILE,
      NOTIFICATION_ABOUT.TRAINER_SESSION,
      NOTIFICATION_TYPE.ACCEPT,
      'Coach accepted your session',
    );

    return {
      ...formattedSession,
      status: SESSION_REQUEST_STATUSES_ENUM.ACCEPTED,
    };
  }

  async coachDeclineNewSession(
    userId: number,
    sessionId: number,
  ): Promise<TrainingSessionResultDto> {
    const coachSessionData: CoachSessionDataDto[] =
      (await this.sessionModel.getCoachSessionData(sessionId)) as CoachSessionDataDto[];
    const validCoachSession = await this.validateChangeSessionRequest(
      userId,
      coachSessionData,
    );
    const { sessionRequestId, coachBookedSessionId } = validCoachSession;
    const [formattedSession] = await Promise.all([
      this.getCoachingSession(userId, sessionId),
      this.sessionModel.updateSessionAndRequest(
        coachBookedSessionId,
        SESSIONS_STATUSES_ENUM.NOT_ACTIVE,
        sessionRequestId,
        SESSION_REQUEST_STATUSES_ENUM.REJECTED,
      ),
    ]);

    // create notification
    await this.notificationModel.createOne(
      coachSessionData[0].userId,
      coachSessionData[0].coachBookedSessionId,
      NOTIFICATION_SENT_TO.PLAYER_PROFILE,
      NOTIFICATION_ABOUT.TRAINER_SESSION,
      NOTIFICATION_TYPE.REJECT,
      'Coach rejected your session',
    );

    return {
      ...formattedSession,
      status: SESSION_REQUEST_STATUSES_ENUM.REJECTED,
    };
  }

  async coachApproveChangeSessionSlot(
    userId: number,
    sessionId: number,
    newSlotId: number,
    newDate: string,
  ): Promise<TrainingSessionResultDto> {
    const coachSessionData: CoachSessionDataDto[] =
      (await this.sessionModel.getCoachSessionData(sessionId)) as CoachSessionDataDto[];

    // console.log({ coachSessionData });

    const validCoachSession = await this.validateChangeSessionRequest(
      userId,
      coachSessionData,
    );

    //validate if there is a booked session
    if (
      await this.trainerScheduleService.checkBookedSlot(
        newSlotId,
        newDate,
        null,
        SESSIONS_STATUSES_ENUM.ACTIVE,
      )
    ) {
      throw new BadRequestException(
        this.i18n.t(`errors.BOOKED_SLOT`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    const { sessionRequestId, coachBookedSessionId } = validCoachSession;

    await this.sessionModel.updateSessionTiming(coachBookedSessionId, newDate, newSlotId);
    await this.sessionModel.updateSessionRequest(
      sessionRequestId,
      SESSION_REQUEST_STATUSES_ENUM.ACCEPTED,
    );
    const formattedSession = await this.getCoachingSession(userId, sessionId);
    await this.rejectRestOfSameDateSlotRequests(newDate, newSlotId);

    // create notification
    await this.notificationModel.createOne(
      coachSessionData[0].userId,
      coachSessionData[0].coachBookedSessionId,
      NOTIFICATION_SENT_TO.PLAYER_PROFILE,
      NOTIFICATION_ABOUT.TRAINER_SESSION,
      NOTIFICATION_TYPE.ACCEPT,
      'Coach accepted your new timing to session',
    );

    return {
      ...formattedSession,
      status: SESSION_REQUEST_STATUSES_ENUM.ACCEPTED,
    };
  }

  async coachDeclineChangeSessionSlot(
    userId: number,
    sessionId: number,
  ): Promise<TrainingSessionResultDto> {
    const coachSessionData: CoachSessionDataDto[] =
      (await this.sessionModel.getCoachSessionData(sessionId)) as CoachSessionDataDto[];

    // console.log({ coachSessionData });

    const validCoachSession = await this.validateChangeSessionRequest(
      userId,
      coachSessionData,
    );

    const { sessionRequestId } = validCoachSession;

    await this.sessionModel.updateSessionRequest(
      sessionRequestId,
      SESSION_REQUEST_STATUSES_ENUM.REJECTED,
    );
    const formattedSession = await this.getCoachingSession(userId, sessionId);

    // create notification
    await this.notificationModel.createOne(
      coachSessionData[0].userId,
      coachSessionData[0].coachBookedSessionId,
      NOTIFICATION_SENT_TO.PLAYER_PROFILE,
      NOTIFICATION_ABOUT.TRAINER_SESSION,
      NOTIFICATION_TYPE.REJECT,
      'Coach rejected your new timing to session',
    );

    return {
      ...formattedSession,
      status: SESSION_REQUEST_STATUSES_ENUM.REJECTED,
    };
  }

  async rejectRestOfSameDateSlotRequests(newDate: string, newSlotId: number) {
    // get all user who booked this slot
    let usersIds = await this.sessionModel.getAllBookedUsersIds(newDate, newSlotId);

    // notify the rejection to all users
    await this.notificationModel.createMany(
      usersIds,
      null,
      NOTIFICATION_SENT_TO.PLAYER_PROFILE,
      NOTIFICATION_ABOUT.TRAINER_SESSION,
      NOTIFICATION_TYPE.REJECT,
      'Coach rejected your new timing to session',
    );

    await this.sessionModel.rejectRestOfSameDateSlotRequests(newDate, newSlotId);
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
      this.validateCancelRequest(userId, coachSessionData),
      this.validateCancellingReasonExistence(cancelReasonData),
    ];
    const { sessionRequestId, coachBookedSessionId } = validCoachSession;
    const [formattedSession] = await Promise.all([
      this.getCoachingSession(userId, sessionId),
      this.sessionModel.updateSetReasonCoachSessionStatus(
        coachBookedSessionId,
        SESSIONS_STATUSES_ENUM.CANCELED,
        validCancellingReason.id,
        CANCELED_BY_ENUM.TRAINER,
      ),
    ]);
    return {
      ...formattedSession,
      status: SESSIONS_STATUSES_ENUM.CANCELED,
    };
  }

  async userCancelSession(
    userId: number,
    sessionId: number,
    cancelReasonId: number,
  ): Promise<TrainingSessionResultDto> {
    // const sessionData: UserSessionDataDto[] =
    //   await this.sessionModel.getUserSessionData(sessionId);
    const [sessionData, cancelReasonData] = await Promise.all([
      await this.sessionModel.getUserSessionData(sessionId),
      this.sessionModel.getCancellingReason(cancelReasonId),
    ]);
    // const validSession = this.validateUserSession(userId, sessionData);
    const [validSession, validCancellingReason] = [
      this.validateUserSession(userId, sessionData),
      this.validateCancellingReasonExistence(cancelReasonData),
    ];
    const { sessionRequestId, bookedSessionId } = validSession;
    const [formattedSession] = await Promise.all([
      this.getTrainingSession(userId, sessionId, HOME_SEARCH_TYPES_ENUM.COACHES),
      // this.sessionModel.updateCoachSessionStatus(
      //   bookedSessionId,
      //   SESSIONS_STATUSES_ENUM.CANCELED,
      //   CANCELED_BY_ENUM.PLAYER,
      // ),
      this.sessionModel.updateSetReasonCoachSessionStatus(
        bookedSessionId,
        SESSIONS_STATUSES_ENUM.CANCELED,
        validCancellingReason.id,
        CANCELED_BY_ENUM.PLAYER,
      ),
    ]);
    return {
      ...formattedSession,
      status: SESSIONS_STATUSES_ENUM.CANCELED,
    };
  }

  // async markSessionAsComplete(theDateTime: string) {}

  async validateChangeSessionRequest(userId, sessionData) {
    // console.log('ours');

    const foundSession = await this.validateSessionExistence(sessionData);
    this.validateSessionViewUserRights(userId, foundSession.coachUserId);
    // if (!foundSession.sessionRequestId) {
    //   throw new BadRequestException(
    //     this.i18n.t(`errors.NOT_FOUND_SESSION_REQUEST`, {
    //       lang: I18nContext.current().lang,
    //     }),
    //   );
    // }
    // if (foundSession.bookedSessionStatus == SESSIONS_STATUSES_ENUM.NOT_ACTIVE) {
    //   throw new BadRequestException(
    //     this.i18n.t(`errors.NOT_ALLOWED_BOOKED_SESSION_STATUS`, {
    //       lang: I18nContext.current().lang,
    //     }),
    //   );
    // }

    this.globalService.validatePassedDateTime(
      sessionData[0].date,
      sessionData[0].fromTime,
    );

    if (foundSession.sessionRequestStatus !== SESSION_REQUEST_STATUSES_ENUM.PENDING) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_ALLOWED_TO_CHANGE_STATUS`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return foundSession;
  }

  validateCancelRequest(userId, sessionData) {
    this.globalService.validatePassedDateTime(
      sessionData[0].date,
      sessionData[0].fromTime,
    );

    const foundSession = this.validateSessionExistence(sessionData);
    this.validateSessionViewUserRights(userId, foundSession.coachUserId);
    // if (!foundSession.sessionRequestId) {
    // throw new BadRequestException(
    //   this.i18n.t(`errors.NOT_FOUND_SESSION_REQUEST`, {
    //     lang: I18nContext.current().lang,
    //   }),
    // );
    // }
    if (foundSession.bookedSessionStatus !== SESSIONS_STATUSES_ENUM.ACTIVE) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_ALLOWED_BOOKED_SESSION_STATUS`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    // if (foundSession.sessionRequestStatus !== SESSION_REQUEST_STATUSES_ENUM.PENDING) {
    //   throw new BadRequestException(
    //     this.i18n.t(`errors.NOT_ALLOWED_TO_CHANGE_STATUS`, {
    //       lang: I18nContext.current().lang,
    //     }),
    //   );
    // }
    return foundSession;
  }

  validateUserSession(userId, sessionData) {
    this.globalService.validatePassedDateTime(
      sessionData[0].date,
      sessionData[0].fromTime,
    );

    const foundSession: UserSessionDataDto = this.validateSessionExistence(sessionData);
    // console.log({ userId });
    // console.log({ foundSession });

    this.validateSessionViewUserRights(userId, foundSession.userId);
    // if (!foundSession.sessionRequestId) {
    //   throw new BadRequestException(
    //     this.i18n.t(`errors.NOT_FOUND_SESSION_REQUEST`, {
    //       lang: I18nContext.current().lang,
    //     }),
    //   );
    // }
    if (foundSession.bookedSessionStatus !== SESSIONS_STATUSES_ENUM.ACTIVE) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_ALLOWED_BOOKED_SESSION_STATUS`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    // if (foundSession.sessionRequestStatus !== SESSION_REQUEST_STATUSES_ENUM.PENDING) {
    //   throw new BadRequestException(
    //     this.i18n.t(`errors.NOT_ALLOWED_TO_CHANGE_STATUS`, {
    //       lang: I18nContext.current().lang,
    //     }),
    //   );
    // }

    // const currentDateTime = moment().utc();
    // const dateMoment = moment(foundSession.date, 'YYYY-MM-DD');
    // const timeMoment = moment(foundSession.fromTime, 'HH:mm:ssZ');

    // Combine date and time
    // const combinedDateTime = dateMoment.set({
    //   hour: timeMoment.hours(),
    //   minute: timeMoment.minutes(),
    //   second: timeMoment.seconds(),
    //   millisecond: timeMoment.milliseconds(),
    // });
    // const dateTimeAfterSubHours = combinedDateTime.subtract(
    //   parseInt(`${foundSession.cancellationHours || 1}`, 10),
    //   'hours',
    // );
    // if (dateTimeAfterSubHours.isBefore(currentDateTime)) {
    //   throw new BadRequestException(
    //     this.i18n.t(`errors.NOT_ALLOWED_TO_CANCEL_SESSION`, {
    //       lang: I18nContext.current().lang,
    //     }),
    //   );
    // }
    return foundSession;
  }

  validateSessionExistence(sessionData) {
    // console.log({ sessionData });

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
