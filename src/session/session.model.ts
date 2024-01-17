import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { BookedSessionDTO } from './dtos/booked-session.dto';
import * as moment from 'moment-timezone';
import { SessionCardDTO } from './dtos/session-card.dto';

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
      AND status = 'active'
    `;
    return TheBookedSlot[0];
  }

  async getBookedSessionBySessionId(sessionId: number): Promise<BookedSessionDTO> {
    let theSession = await this.prisma.$queryRaw`
      SELECT *
      FROM TrainerBookedSession
      WHERE id = ${sessionId}
      AND status = 'active'
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
    TrainerBookedSession.status = 'active'
    `;
    return scheduleSessions;
  }

  async savePlayerSessionRating(
    userId: number,
    trainerBookedSessionId: number,
    ratingNumber: number,
    feedback: string,
  ) {
    await this.prisma.$queryRaw`
    INSERT INTO Rate
    (
      userId,
      trainerBookedSessionId,
      rateableType,
      ratingNumber,
      feedback,
      profileType
    )
    VALUES
  (
    ${userId},
    ${trainerBookedSessionId},
    "session",
    ${ratingNumber},
    ${feedback},
    "player"
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
    'accepted'
  )`;
  }

  async createTrainerBookedSession(
    userId: number,
    dayDate: string,
    trainerProfileId: number,
    slotId: number,
  ) {
    let createdTrainerBookedSession: any = await this.prisma.$transaction(
      [
        this.prisma.$queryRaw`
        INSERT INTO TrainerBookedSession
        (
          userId,
          date,
          trainerProfileId,
          slotId,
          status
        )
        VALUES
      (
        ${userId},
        ${dayDate},
        ${trainerProfileId},
        ${slotId},
        'active'
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
}
