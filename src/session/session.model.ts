import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { BookedSessionDTO } from './dtos/booked-session.dto';
import { SessionCardDTO } from './dtos/session-card.dto';
import { UserSessionDataDto } from './dtos/user-session-data.dto';
import {
  PROFILE_TYPES_ENUM,
  RATEABLE_TYPES_ENUM,
  SESSIONS_STATUSES_ENUM,
  SESSION_REQUEST_STATUSES_ENUM,
} from 'src/global/enums';

@Injectable()
export class SessionModel {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async getBookedSessionBySlotId(
    slotId: number,
    dayDate: string,
  ): Promise<BookedSessionDTO> {
    let TheBookedSlot = await this.prisma.$queryRaw`
      SELECT *
      FROM TrainerBookedSession
      WHERE slotId = ${slotId}
      AND date = ${dayDate}
      AND status = ${SESSIONS_STATUSES_ENUM.ACTIVE}
    `;
    return TheBookedSlot[0];
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
    ${RATEABLE_TYPES_ENUM.TRAINER}
    ${ratingNumber},
    ${feedback},
    ${PROFILE_TYPES_ENUM.PLAYER}
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
        'name', s.name)) 
      END AS sports
      FROM TrainerProfileSports
      LEFT JOIN Sport AS s ON TrainerProfileSports.sportId = s.id
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
    ${SESSION_REQUEST_STATUSES_ENUM.ACCEPTED}
  )`;
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

  async markSessionAsComplete(userId: number, theDateTime: string) {
    console.log({ theDateTime });

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

  // //

  async getCoachTrainingSession(sessionId: number) {
    return this.prisma.$queryRaw`
      SELECT
        tbs.id AS coachBookedSessionId,
        tbs.userId AS userId,
        sr.status AS status,
        tp.level AS coachLevel,
        tp.userId AS coachUserId,
        tbs.date AS bookedDate,
        tbs.gmt AS gmt,
        u.firstName AS firstName,
        u.lastName AS lastName,
        u.profileImage AS profileImage,
        r.name AS region,
        CASE
          WHEN COUNT( tps.sportId ) > 0 THEN
          JSON_ARRAYAGG(s.name) ELSE NULL 
        END AS sports,
        Slot.fromTime AS fromTime,
        Slot.toTime AS toTime,
        tp.cost AS cost 
      FROM
        TrainerBookedSession tbs
        JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
        LEFT JOIN SessionRequest sr ON tbs.id = sr.trainerBookedSessionId
        LEFT JOIN Slot ON Slot.id = tbs.slotId
        LEFT JOIN Field f ON f.id = Slot.fieldId
        LEFT JOIN Region r ON f.regionId = r.id
        LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
        LEFT JOIN Sport s ON tps.sportId = s.id
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
        tp.level AS coachLevel,
        pp.level AS playerLevel,
        tp.userId AS coachUserId,
        tbs.date AS bookedDate,
        tbs.gmt AS gmt,
        u.firstName AS firstName,
        u.lastName AS lastName,
        u.profileImage AS profileImage,
        r.name AS region,
        CASE
          WHEN COUNT( tps.sportId ) > 0 THEN
          JSON_ARRAYAGG(s.name) ELSE NULL 
        END AS sports,
        Slot.fromTime AS fromTime,
        Slot.toTime AS toTime,
        tp.cost AS cost 
      FROM
        TrainerBookedSession tbs
        JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
        JOIN PlayerProfile pp ON pp.userId = tbs.userId
        LEFT JOIN SessionRequest sr ON tbs.id = sr.trainerBookedSessionId
        LEFT JOIN Slot ON Slot.id = tbs.slotId
        LEFT JOIN Field f ON f.id = Slot.fieldId
        LEFT JOIN Region r ON f.regionId = r.id
        LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
        LEFT JOIN Sport s ON tps.sportId = s.id
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
        sr.id AS sessionRequestId,
        sr.status AS sessionRequestStatus,
        tbs.status AS bookedSessionStatus,
        sr.type AS sessionRequestType,
        tp.userId AS coachUserId
      FROM
        TrainerBookedSession tbs
        JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
        LEFT JOIN SessionRequest sr ON tbs.id = sr.trainerBookedSessionId
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
        *
      FROM
        CancellationReasons
    `;
  }

  async getCancellingReason(id) {
    return this.prisma.$queryRaw`
      SELECT
        *
      FROM
        CancellationReasons
      WHERE
        id = ${id}
    `;
  }

  async updateCoachSessionStatus(
    bookedSessionId,
    bookedSessionStatus,
    sessionRequestId,
    sessionRequestStatus,
    canceledBy = null,
  ) {
    return this.prisma.$transaction([
      this.prisma.$queryRaw`
            UPDATE
              SessionRequest
            SET
              status = ${sessionRequestStatus}
              ${canceledBy ? Prisma.sql`, canceledBy = ${canceledBy}` : Prisma.empty}
            WHERE
              id = ${sessionRequestId};
          `,
      this.prisma.$queryRaw`
            UPDATE TrainerBookedSession SET status = ${bookedSessionStatus} WHERE id = ${bookedSessionId};
          `,
    ]);
  }

  async updateSetReasonCoachSessionStatus(
    bookedSessionId,
    bookedSessionStatus,
    sessionRequestId,
    sessionRequestStatus,
    cancellationReasonsId,
    canceledBy,
  ) {
    return this.prisma.$transaction([
      this.prisma.$queryRaw`
          UPDATE
            SessionRequest
          SET
            status = ${sessionRequestStatus},
            cancellationReasonsId = ${cancellationReasonsId},
            canceledBy = ${canceledBy}
          WHERE
            id = ${sessionRequestId};
        `,
      this.prisma.$queryRaw`
          UPDATE TrainerBookedSession SET status = ${bookedSessionStatus} WHERE id = ${bookedSessionId};
        `,
    ]);
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
        r.name AS region,
        s.name AS specialization,
        dc.slotDuration AS slotDuration,
        dc.cost AS cost 
      FROM
        DoctorClinicsBookedHours dbh
        JOIN DoctorClinic dc ON dbh.doctorClinicId = dc.id
        LEFT JOIN Region r ON dc.regionId = r.id
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
        r.name AS region,
        s.name AS sport,
        f.slotDuration AS slotDuration,
        f.description AS description,
        f.cost AS cost 
      FROM
        FieldsBookedHours fbh
        JOIN Field f ON fbh.fieldId = f.id
        LEFT JOIN Region r ON f.regionId = r.id
        LEFT JOIN Sport s ON f.sportId = s.id 
      WHERE
        fbh.id = ${sessionId}
      GROUP BY
        fbh.id
    `;
  }
}
