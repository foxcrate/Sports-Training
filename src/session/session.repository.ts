import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { BookedSessionDTO } from './dtos/booked-session.dto';
import { SessionCardDTO } from './dtos/session-card.dto';
import { UserSessionDataDto } from './dtos/user-session-data.dto';
import moment from 'moment-timezone';
import {
  PROFILE_TYPES_ENUM,
  RATEABLE_TYPES_ENUM,
  SESSIONS_STATUSES_ENUM,
  SESSION_REQUEST_STATUSES_ENUM,
} from 'src/global/enums';
import { SessionRequestDTO } from './dtos/session-request.dto';
import { PendingSessionDTO } from './dtos/pending-session.dto';

@Injectable()
export class SessionRepository {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async getBookedSessionBySlotId(
    slotId: number,
    dayDate: string,
    userId: number = null,
    status: string = null,
  ): Promise<BookedSessionDTO> {
    let TheBookedSlot = await this.prisma.$queryRaw`
      SELECT *
      FROM TrainerBookedSession
      WHERE slotId = ${slotId}
      AND date = ${dayDate}
      ${userId ? Prisma.sql`AND userId = ${userId}` : Prisma.empty}
      ${status ? Prisma.sql`AND status = ${status}` : Prisma.empty}
    `;
    return TheBookedSlot[0];
  }

  async getSessionRequestByid(sessionRequestId: number): Promise<SessionRequestDTO> {
    let sessionRequest = await this.prisma.$queryRaw`
      SELECT *
      FROM SessionRequest
      WHERE id = ${sessionRequestId}
    `;
    return sessionRequest[0];
  }

  async getBookedSessionIdByRequestId(sessionRequestId: number): Promise<number> {
    let sessionId = await this.prisma.$queryRaw`
      SELECT trainerBookedSessionId AS id
      FROM SessionRequest
      WHERE id = ${sessionRequestId}
    `;
    if (!sessionId[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.SESSION_REQUEST_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return sessionId[0].id;
  }

  async getBookedSessionBySessionId(sessionId: number): Promise<BookedSessionDTO> {
    let theSession = await this.prisma.$queryRaw`
      SELECT *
      FROM TrainerBookedSession
      WHERE id = ${sessionId}
      AND status = ${SESSIONS_STATUSES_ENUM.ACTIVE}
    `;
    if (!theSession[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.BOOKED_SESSION_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return theSession[0];
  }

  async getBookedSessionsByScheduleId(scheduleId: number): Promise<BookedSessionDTO[]> {
    let scheduleSessions: BookedSessionDTO[] = await this.prisma.$queryRaw`
    With ScheduleSlotsIds AS(
      SELECT Slot.id AS slotsIds
      FROM Schedule
      LEFT JOIN Slot ON Slot.scheduleId = Schedule.id
      WHERE Schedule.id = ${scheduleId}
    )
    SELECT
    *
    FROM
    TrainerBookedSession
    WHERE
    TrainerBookedSession.slotId IN (SELECT slotsIds FROM ScheduleSlotsIds)
    AND
    TrainerBookedSession.status = ${SESSIONS_STATUSES_ENUM.ACTIVE}
    `;
    return scheduleSessions;
  }

  async savePlayerTrainerRating(
    userId: number,
    trainerProfileId: number,
    ratingNumber: number,
    feedback: string,
  ) {
    await this.prisma.$queryRaw`
    INSERT INTO Rate
    (
      userId,
      trainerProfileId,
      rateableType,
      ratingNumber,
      feedback,
      profileType
    )
    VALUES
  (
    ${userId},
    ${trainerProfileId},
    ${RATEABLE_TYPES_ENUM.TRAINER},
    ${ratingNumber},
    ${feedback},
    ${PROFILE_TYPES_ENUM.PLAYER}
  )`;
  }

  async saveTrainerPlayerRating(
    userId: number,
    playerProfileId: number,
    ratingNumber: number,
    feedback: string,
  ) {
    await this.prisma.$queryRaw`
    INSERT INTO Rate
    (
      userId,
      playerProfileId,
      rateableType,
      ratingNumber,
      feedback,
      profileType
    )
    VALUES
  (
    ${userId},
    ${playerProfileId},
    ${RATEABLE_TYPES_ENUM.PLAYER},
    ${ratingNumber},
    ${feedback},
    ${PROFILE_TYPES_ENUM.TRAINER}
  )`;
  }

  async getTrainerBookedSessionCard(
    trainerBookedSessionId: number,
  ): Promise<SessionCardDTO> {
    let theCard = await this.prisma.$queryRaw`
    WITH TrainerSessionData AS ( 
      SELECT
      TrainerBookedSession.id AS id,
      TrainerBookedSession.userId AS userId,
      TrainerBookedSession.date AS date,
      TrainerBookedSession.trainerProfileId AS trainerProfileId,
      Slot.fromTime AS fromTime,
      Slot.toTime AS toTime,
      Slot.cost AS cost
      FROM TrainerBookedSession
      LEFT JOIN Slot ON Slot.id = TrainerBookedSession.slotId
      WHERE TrainerBookedSession.id = ${trainerBookedSessionId}
    ),
    TrainerSports AS(
      SELECT 
      CASE 
      WHEN COUNT(s.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',s.id,
        'name', SportTranslation.name)) 
      END AS sports
      FROM TrainerProfileSports
      LEFT JOIN Sport AS s ON TrainerProfileSports.sportId = s.id
      LEFT JOIN SportTranslation AS SportTranslation ON SportTranslation.sportId = s.id
        AND SportTranslation.language = ${I18nContext.current().lang}
      WHERE TrainerProfileSports.trainerProfileId = (SELECT trainerProfileId FROM TrainerSessionData)
    )
    SELECT
      User.firstName AS firstName,
      User.lastName AS lastName,
      User.profileImage AS profileImage,
      TrainerSessionData.date AS date,
      TrainerSessionData.trainerProfileId AS trainerProfileId,
      TrainerSessionData.fromTime AS fromTime,
      TrainerSessionData.toTime AS toTime,
      TrainerSessionData.cost AS cost,
      (SELECT sports FROM TrainerSports) AS sports
      FROM TrainerSessionData
      LEFT JOIN User ON TrainerSessionData.userId = User.id
    `;

    if (!theCard[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return theCard[0];
  }

  async createNewTrainerSessionRequest(trainerBookedSessionId: number) {
    await this.prisma.$queryRaw`
    INSERT INTO SessionRequest
    (
      trainerBookedSessionId,
      status
    )
    VALUES
  (
    ${trainerBookedSessionId},
    ${SESSION_REQUEST_STATUSES_ENUM.PENDING}
  )`;
  }

  async createChangeSessionSlotRequest(
    trainerBookedSessionId: number,
    newSessionDate: string,
    newSlotId: number,
  ) {
    //   await this.prisma.$queryRaw`
    //   INSERT INTO SessionRequest
    //   (
    //     trainerBookedSessionId,
    //     status,
    //     type,
    //     newSessionDate,
    //     newSlotId
    //   )
    //   VALUES
    // (
    //   ${trainerBookedSessionId},
    //   ${SESSION_REQUEST_STATUSES_ENUM.PENDING},
    //   'change',
    //   ${newSessionDate},
    //   ${newSlotId},
    // )`;
    await this.prisma.$queryRaw`
    UPDATE SessionRequest
    SET
    status = ${SESSION_REQUEST_STATUSES_ENUM.PENDING},
    type = 'change',
    newSessionDate = ${newSessionDate},
    newSlotId = ${newSlotId}
    WHERE trainerBookedSessionId = ${trainerBookedSessionId};
    `;
  }

  async createTrainerBookedSession(
    userId: number,
    dayDate: string,
    trainerProfileId: number,
    slotId: number,
  ): Promise<BookedSessionDTO> {
    let createdTrainerBookedSession: any = await this.prisma.$transaction(
      [
        this.prisma.$queryRaw`
        INSERT INTO TrainerBookedSession
        (
          userId,
          date,
          trainerProfileId,
          slotId
        )
        VALUES
      (
        ${userId},
        ${dayDate},
        ${trainerProfileId},
        ${slotId}
      )`,
        this.prisma.$queryRaw`
        SELECT
          *
        FROM TrainerBookedSession
        WHERE
        id = LAST_INSERT_ID()
        `,
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
    return createdTrainerBookedSession[1][0];
  }

  async createPackageSession(
    userId: number,
    dayDate: string,
    trainerProfileId: number,
    slotId: number,
    packageId: number,
  ) {
    let createdTrainerBookedSession: any = await this.prisma.$queryRaw`
        INSERT INTO TrainerBookedSession
        (
          userId,
          date,
          trainerProfileId,
          slotId,
          packageId,
          status
        )
        VALUES
      (
        ${userId},
        ${dayDate},
        ${trainerProfileId},
        ${slotId},
        ${packageId},
        ${SESSIONS_STATUSES_ENUM.ACTIVE}
      )`;
    return true;
  }

  async markSessionAsComplete(userId: number, theDateTime: string) {
    // console.log({ theDateTime });

    let finishedSessionsIds = await this.prisma.$queryRaw`
      with timePassedSessions as (
        select
        TrainerBookedSession.id
        from
        TrainerBookedSession
        left join Slot
        on Slot.id = TrainerBookedSession.slotId
        where
        CONCAT(TrainerBookedSession.date,' ', Slot.toTime) < ${theDateTime}
        and
        TrainerBookedSession.status = ${SESSIONS_STATUSES_ENUM.ACTIVE}
      )
      select * from timePassedSessions;
    `;
    return finishedSessionsIds;
  }

  async markChildsSessionsAsComplete(childsIds: number[], theDateTime: string) {
    //
  }

  async getPendingSessions(trainerProfileId: number): Promise<PendingSessionDTO[]> {
    let todayDate = moment().format('YYYY-MM-DD');
    let pendingSessions: PendingSessionDTO[] = await this.prisma.$queryRaw`
      SELECT
        SessionRequest.id AS sessionRequestId,  
        SessionRequest.type AS type,  
        TrainerBookedSession.id AS bookedSessionId,
        SessionRequest.status AS sessionRequestStatus,
        TrainerBookedSession.date AS date,
        CASE
        WHEN SessionRequest.type = 'change' THEN
        SessionRequest.newSessionDate
        END
        AS newSessionDate,
        CASE
        WHEN SessionRequest.type = 'change' THEN
        (
          SELECT JSON_OBJECT(
          'id',InnerSessionRequest.newSlotId,
          'fromTime', Slot.fromTime,
          'toTime', Slot.toTime
          )
          FROM SessionRequest AS InnerSessionRequest
          LEFT JOIN Slot ON Slot.id = InnerSessionRequest.newSlotId
          WHERE InnerSessionRequest.id = SessionRequest.id
        )
        END
        AS newSlot,
        JSON_OBJECT(
          'id',Slot.id,
          'fromTime', Slot.fromTime,
          'toTime', Slot.toTime
          ) AS slot,
       JSON_OBJECT(
          'id',User.id,
          'firstName', User.firstName,
          'lasttName', User.lastName,
          'profileImage', User.profileImage
          ) AS user,
        JSON_OBJECT(
          'fieldId',Field.id,
          'fieldRegionId', Region.id,
          'fieldRegionName', MAX(RegionTranslation.name)
          ) AS field,
        CASE WHEN COUNT(Sport.id) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(JSON_OBJECT(
          'id',Sport.id,
          'name', SportTranslation.name
          ))
        END AS sports
      FROM TrainerBookedSession
      JOIN TrainerProfile ON TrainerBookedSession.trainerProfileId = TrainerProfile.id
      LEFT JOIN SessionRequest ON TrainerBookedSession.id = SessionRequest.trainerBookedSessionId
      LEFT JOIN Slot ON Slot.id = TrainerBookedSession.slotId
      LEFT JOIN User ON User.id = TrainerBookedSession.userId
      LEFT JOIN Field ON Slot.fieldId = Field.id
      LEFT JOIN Region ON Field.regionID = Region.id
      LEFT JOIN RegionTranslation AS RegionTranslation ON RegionTranslation.regionId = Region.id
      AND RegionTranslation.language = ${I18nContext.current().lang}
      LEFT JOIN TrainerProfileSports ON TrainerProfile.id = TrainerProfileSports.trainerProfileId
      LEFT JOIN Sport ON TrainerProfileSports.sportId = Sport.id
      LEFT JOIN SportTranslation AS SportTranslation ON SportTranslation.sportId = Sport.id
        AND SportTranslation.language = ${I18nContext.current().lang}
      WHERE TrainerBookedSession.trainerProfileId = ${trainerProfileId}
      AND TrainerBookedSession.date >= ${todayDate}
      AND SessionRequest.status = ${SESSION_REQUEST_STATUSES_ENUM.PENDING}
      GROUP BY TrainerBookedSession.id
    `;
    let newPending = pendingSessions.map((session) => {
      session.date = moment(session.date).format('YYYY-MM-DD');
      session.slot.fromTime = moment(`${session.date} ${session.slot.fromTime}`).format(
        'hh:mm A',
      );
      session.slot.toTime = moment(`${session.date} ${session.slot.toTime}`).format(
        'hh:mm A',
      );
      if (session.type === 'change') {
        session.newSessionDate = moment(session.newSessionDate).format('YYYY-MM-DD');
        session.newSlot.fromTime = moment(
          `${session.newSessionDate} ${session.newSlot.fromTime}`,
        ).format('hh:mm A');
        session.newSlot.toTime = moment(
          `${session.newSessionDate} ${session.newSlot.toTime}`,
        ).format('hh:mm A');
      }

      console.log({ session });

      if (moment(`${session.date} ${session.slot.fromTime}`) > moment()) {
        return session;
      }

      // console.log('sessionDateTime:', moment(`${session.date} ${session.slot.fromTime}`));
      // console.log('now:', moment());

      // return session;
    });

    return newPending;
  }

  async rejectRestOfSameDateSlotRequests(date: string, slotId: number) {
    await this.prisma.$queryRaw`
      UPDATE
      SessionRequest
      SET status = ${SESSION_REQUEST_STATUSES_ENUM.REJECTED}
      WHERE trainerBookedSessionId IN (
        SELECT id
        FROM TrainerBookedSession
        WHERE date = ${date}
        AND slotId = ${slotId}
        AND status = ${SESSIONS_STATUSES_ENUM.NOT_ACTIVE}
      )
    `;
  }

  // //

  async getCoachTrainingSession(sessionId: number) {
    return this.prisma.$queryRaw`
      SELECT
        tbs.id AS coachBookedSessionId,
        tbs.userId AS userId,
        sr.status AS status,
        MAX(LevelTranslation.name) AS coachLevel,
        tp.userId AS coachUserId,
        tbs.date AS bookedDate,
        tbs.gmt AS gmt,
        u.firstName AS firstName,
        u.lastName AS lastName,
        u.mobileNumber AS mobileNumber,
        u.profileImage AS profileImage,
        f.name AS fieldName,
        f.longitude AS filedLongitude,
        f.latitude AS filedLatitude,
        MAX(RegionTranslation.name) AS region,
        CASE
          WHEN COUNT( tps.sportId ) > 0 THEN
          JSON_ARRAYAGG(SportTranslation.name) ELSE NULL 
        END AS sports,
        Slot.fromTime AS fromTime,
        Slot.toTime AS toTime,
        tp.cost AS cost 
      FROM
        TrainerBookedSession tbs
        JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
        LEFT JOIN Level ON tp.levelId = Level.id
        LEFT JOIN LevelTranslation ON LevelTranslation.levelId = Level.id
        AND LevelTranslation.language = ${I18nContext.current().lang}
        LEFT JOIN SessionRequest sr ON tbs.id = sr.trainerBookedSessionId
        LEFT JOIN Slot ON Slot.id = tbs.slotId
        LEFT JOIN Field f ON f.id = Slot.fieldId
        LEFT JOIN Region r ON f.regionId = r.id
        LEFT JOIN RegionTranslation AS RegionTranslation ON RegionTranslation.regionId = r.id
        AND RegionTranslation.language = ${I18nContext.current().lang}
        LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
        LEFT JOIN Sport s ON tps.sportId = s.id
        LEFT JOIN SportTranslation AS SportTranslation ON SportTranslation.sportId = s.id
        AND SportTranslation.language = ${I18nContext.current().lang}
        LEFT JOIN User u ON tp.userId = u.id
      WHERE
        tbs.id = ${sessionId}
      GROUP BY
        tbs.id
    `;
  }

  async getCoachingSession(sessionId: number) {
    return this.prisma.$queryRaw`
      SELECT
        tbs.id AS coachBookedSessionId,
        tbs.userId AS userId,
        sr.status AS status,
        MAX(LevelTranslation.name) AS coachLevel,
        tp.userId AS coachUserId,
        tbs.date AS bookedDate,
        tbs.gmt AS gmt,
        u.firstName AS firstName,
        u.lastName AS lastName,
        u.mobileNumber AS mobileNumber,
        u.profileImage AS profileImage,
        f.name AS fieldName,
        f.longitude AS filedLongitude,
        f.latitude AS filedLatitude,
        MAX(RegionTranslation.name) AS region,
        CASE
          WHEN COUNT( tps.sportId ) > 0 THEN
          JSON_ARRAYAGG(SportTranslation.name) ELSE NULL 
        END AS sports,
        Slot.fromTime AS fromTime,
        Slot.toTime AS toTime,
        tp.cost AS cost 
      FROM
        TrainerBookedSession tbs
        JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
        LEFT JOIN Level ON tp.levelId = Level.id
        LEFT JOIN LevelTranslation ON LevelTranslation.levelId = Level.id
        AND LevelTranslation.language = ${I18nContext.current().lang}
        LEFT JOIN SessionRequest sr ON tbs.id = sr.trainerBookedSessionId
        LEFT JOIN Slot ON Slot.id = tbs.slotId
        LEFT JOIN Field f ON f.id = Slot.fieldId
        LEFT JOIN Region r ON f.regionId = r.id
        LEFT JOIN RegionTranslation AS RegionTranslation ON RegionTranslation.regionId = r.id
        AND RegionTranslation.language = ${I18nContext.current().lang}
        LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
        LEFT JOIN Sport s ON tps.sportId = s.id
        LEFT JOIN SportTranslation AS SportTranslation ON SportTranslation.sportId = s.id
        AND SportTranslation.language = ${I18nContext.current().lang}
        LEFT JOIN User u ON tbs.userId = u.id
      WHERE
        tbs.id = ${sessionId}
      GROUP BY
        tbs.id
    `;
  }

  async getCoachSessionData(sessionId: number) {
    return this.prisma.$queryRaw`
      SELECT
        tbs.id AS coachBookedSessionId,
        Slot.id AS slotId,
        sr.newSlotId AS newSlotId,
        sr.newSessionDate AS newDate,
        Slot.fromTime AS fromTime,
        Slot.toTime AS toTime,
        sr.id AS sessionRequestId,
        sr.status AS sessionRequestStatus,
        tbs.status AS bookedSessionStatus,
        tbs.date AS date,
        sr.type AS sessionRequestType,
        tbs.userId AS userId,
        tp.userId AS coachUserId
      FROM
        TrainerBookedSession tbs
        JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
        LEFT JOIN SessionRequest sr ON tbs.id = sr.trainerBookedSessionId
        LEFT JOIN Slot ON Slot.id = tbs.slotId
      WHERE
        tbs.id = ${sessionId}
      GROUP BY
        tbs.id
    `;
  }

  async getUserSessionData(sessionId: number): Promise<UserSessionDataDto[]> {
    return this.prisma.$queryRaw`
      SELECT
        tbs.id AS bookedSessionId,
        sr.id AS sessionRequestId,
        sr.status AS sessionRequestStatus,
        tbs.status AS bookedSessionStatus,
        sr.type AS sessionRequestType,
        tp.defaultCancellationTime AS cancellationHours,
        tbs.date AS date,
        Slot.id AS slotId,
        Slot.fromTime AS fromTime,
        Slot.toTime AS toTime,
        tbs.userId AS userId
      FROM
        TrainerBookedSession tbs
        JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
        LEFT JOIN SessionRequest sr ON tbs.id = sr.trainerBookedSessionId
        LEFT JOIN Slot ON Slot.id = tbs.slotId
      WHERE
        tbs.id = ${sessionId}
      GROUP BY
        tbs.id
    `;
  }

  async getCancellingReasons() {
    return this.prisma.$queryRaw`
      SELECT
        CancellationReasons.id,
        CancellationReasonsTranslation.name AS name
      FROM
        CancellationReasons
      LEFT JOIN CancellationReasonsTranslation
      ON CancellationReasonsTranslation.cancellationReasonsId = CancellationReasons.id
      AND CancellationReasonsTranslation.language = ${I18nContext.current().lang}
    `;
  }

  async getCancellingReason(id) {
    let reason = await this.prisma.$queryRaw`
      SELECT
        CancellationReasons.id,
        CancellationReasonsTranslation.name AS name
      FROM
        CancellationReasons
      LEFT JOIN CancellationReasonsTranslation
      ON CancellationReasonsTranslation.cancellationReasonsId = CancellationReasons.id
      AND CancellationReasonsTranslation.language = ${I18nContext.current().lang}
      WHERE
      CancellationReasons.id = ${id}
    `;
    return reason[0];
  }

  async updateCoachSessionStatus(
    bookedSessionId,
    bookedSessionStatus,
    canceledBy = null,
  ) {
    await this.prisma.$queryRaw`
            UPDATE
              TrainerBookedSession
            SET
              status = ${bookedSessionStatus}
              ${canceledBy ? Prisma.sql`, canceledBy = ${canceledBy}` : Prisma.empty}
            WHERE
              id = ${bookedSessionId};
          `;
  }

  async updateSessionRequest(sessionRequestId, sessionRequestStatus) {
    await this.prisma.$queryRaw`
      UPDATE
        SessionRequest
      SET
        status = ${sessionRequestStatus}
      WHERE
        id = ${sessionRequestId};
    `;
  }

  async updateSessionTiming(sessionId: number, dayDate: string, slotId: number) {
    await this.prisma.$queryRaw`
      UPDATE
        TrainerBookedSession
      SET
        date = ${dayDate},
        slotId = ${slotId}
      WHERE
        id = ${sessionId};
    `;
  }

  async getAllBookedUsersSessionsIds(date: string, slotId: number) {
    let result = await this.prisma.$queryRaw`
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          "userId",TrainerBookedSession.userId,
          "sessionId",TrainerBookedSession.id
        )
      ) AS usersIdsWithsessionsIds
      FROM TrainerBookedSession
      WHERE date = ${date}
      AND slotId = ${slotId}
      AND status = 'notActive'
    `;

    return result[0].usersIdsWithsessionsIds ? result[0].usersIdsWithsessionsIds : [];
  }

  async updateSessionAndRequest(
    bookedSessionId: number,
    bookedSessionStatus: string,
    sessionRequestId: number,
    sessionRequestStatus: string,
    declineReasonId: number = null,
  ) {
    return await this.prisma.$transaction([
      this.prisma.$queryRaw`
            UPDATE
              SessionRequest
            SET
              status = ${sessionRequestStatus}
              ${
                declineReasonId
                  ? Prisma.sql`,declineReasonId = ${declineReasonId}`
                  : Prisma.empty
              }
            WHERE
              id = ${sessionRequestId};
          `,
      this.prisma.$queryRaw`
            UPDATE TrainerBookedSession SET status = ${bookedSessionStatus} WHERE id = ${bookedSessionId};
          `,
    ]);
  }

  async cancelSession(bookedSessionId, canceledBy) {
    await this.prisma.$queryRaw`
          UPDATE
            TrainerBookedSession
          SET
            status = ${SESSIONS_STATUSES_ENUM.CANCELED},
            canceledBy = ${canceledBy}
          WHERE
            id = ${bookedSessionId};
        `;
  }

  async getDoctorTrainingSession(sessionId: number) {
    return this.prisma.$queryRaw`
      SELECT
        dbh.id AS doctorBookedHoursId,
        dbh.userId AS userId,
        dbh.fromDateTime AS bookedDateTime,
        dbh.gmt AS gmt,
        dc.name AS name,
        dc.profileImage AS profileImage,
        MAX(RegionTranslation.name) AS region,
        s.name AS specialization,
        dc.slotDuration AS slotDuration,
        dc.cost AS cost 
      FROM
        DoctorClinicsBookedHours dbh
        JOIN DoctorClinic dc ON dbh.doctorClinicId = dc.id
        LEFT JOIN Region r ON dc.regionId = r.id
        LEFT JOIN RegionTranslation AS RegionTranslation ON RegionTranslation.regionId = r.id
        AND RegionTranslation.language = ${I18nContext.current().lang}
        LEFT JOIN DoctorClinicSpecialization s ON dc.doctorClinicSpecializationId = s.id 
      WHERE
        dbh.id = ${sessionId}
      GROUP BY
        dbh.id
    `;
  }

  async getFieldTrainingSession(sessionId: number) {
    return this.prisma.$queryRaw`
      SELECT
        fbh.id AS fieldBookedHoursId,
        fbh.userId AS userId,
        fbh.fromDateTime AS bookedDateTime,
        fbh.gmt AS gmt,
        f.name AS name,
        f.profileImage AS profileImage,
        MAX(RegionTranslation.name) AS region,
        SportTranslation.name AS sport,
        f.slotDuration AS slotDuration,
        f.description AS description,
        f.cost AS cost 
      FROM
        FieldsBookedHours fbh
        JOIN Field f ON fbh.fieldId = f.id
        LEFT JOIN Region r ON f.regionId = r.id
        LEFT JOIN RegionTranslation AS RegionTranslation ON RegionTranslation.regionId = r.id
        AND RegionTranslation.language = ${I18nContext.current().lang}
        LEFT JOIN Sport s ON f.sportId = s.id 
        LEFT JOIN SportTranslation AS SportTranslation ON SportTranslation.sportId = s.id
        AND SportTranslation.language = ${I18nContext.current().lang}
      WHERE
        fbh.id = ${sessionId}
      GROUP BY
        fbh.id
    `;
  }
}
