import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ScheduleSlotsDetailsDTO } from './dtos/schedule-slots-details';
import { ScheduleCreateDto } from './dtos/create.dto';
import { ReturnScheduleDto } from './dtos/return.dto';
import * as moment from 'moment-timezone';
import { SlotDetailsDto } from './dtos/slot-details.dto';
import { FieldReturnDto } from 'src/field/dtos/return.dto';
import { ReturnTrainerProfileDto } from 'src/trainer-profile/dtos/return.dto';
import { BookedSessionDTO } from './dtos/booked-session.dto';

@Injectable()
export class TrainerScheduleModel {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async getAll(trainerProfileId: number): Promise<ScheduleSlotsDetailsDTO[]> {
    let allSchedules: ScheduleSlotsDetailsDTO[] = await this.prisma.$queryRaw`
    SELECT
    s.id AS id,
    s.trainerProfileId AS trainerProfileId,
    s.createdAt AS createdAt,
    CASE WHEN COUNT(m.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(m.monthNumber)
    END AS scheduleMonths
    FROM
    Schedule AS s
    LEFT JOIN SchedulesMonths AS sm
    ON s.id = sm.ScheduleId
    LEFT JOIN Month AS m
    ON sm.monthId = m.id
    WHERE s.trainerProfileId = ${trainerProfileId}
    GROUP BY s.id;
    `;

    return allSchedules;
  }

  async getByID(timezone, id: number): Promise<ScheduleSlotsDetailsDTO> {
    let TheSchedule = await this.prisma.$queryRaw`
    WITH ScheduleWithMonths AS (
    SELECT
    sch.id AS id,
    sch.trainerProfileId AS trainerProfileId,
    CASE WHEN COUNT(m.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(m.monthNumber)
    END AS scheduleMonths
    FROM
    Schedule AS sch
    LEFT JOIN SchedulesMonths AS sm
    ON sch.id = sm.ScheduleId
    LEFT JOIN Month AS m
    ON sm.monthId = m.id
    WHERE sch.id = ${id}
    GROUP BY sch.id
    )
    SELECT
    swm.id,swm.trainerProfileId,swm.scheduleMonths,
    CASE
    WHEN COUNT(sl.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(JSON_OBJECT(
      'id',sl.id,
      'name',sl.name,
      'fromTime', sl.fromTime,
      'toTime', sl.toTime,
      'cost', sl.cost,
      'fieldId', sl.fieldId,
      'weekDayNumber', sl.weekDayNumber,
      'weekDayName', sl.weekDayName
      ))
    END AS ScheduleSlots
    FROM ScheduleWithMonths AS swm
    LEFT JOIN Slot AS sl
    ON swm.id = sl.ScheduleId
    GROUP BY swm.id
    `;

    if (!TheSchedule[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    let schedule = TheSchedule[0];

    schedule.ScheduleSlots = this.timezonedSlots(timezone, schedule.ScheduleSlots);
    return schedule;
  }

  async create(
    timezone,
    trainerProfileId: number,
    reqBody: ScheduleCreateDto,
  ): Promise<ScheduleSlotsDetailsDTO> {
    let createdSchedule: ReturnScheduleDto[] = await this.prisma.$transaction(
      [
        this.prisma.$queryRaw`
        INSERT INTO Schedule
        (
          trainerProfileId
        )
        VALUES
      (
        ${trainerProfileId}
      )`,
        this.prisma.$queryRaw`
        SELECT
          *
        FROM Schedule
        WHERE
        id = LAST_INSERT_ID()
        `,
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
    let newSchedule = createdSchedule[1][0];

    Promise.all([
      await this.savingNewScheduleMonths(newSchedule.id, reqBody.months),
      await this.savingNewScheduleSlots(newSchedule.id, reqBody.slots),
    ]);

    return await this.getByID(timezone, newSchedule.id);
  }

  async update(timezone, scheduleId: number, reqBody: ScheduleCreateDto) {
    let theSchedule = await this.getByID(timezone, scheduleId);

    Promise.all([
      //delete past scheduleMonths
      await this.deleteScheduleMonths(scheduleId),
      //delete past scheduleSlots
      await this.deleteScheduleSlots(scheduleId),
    ]);

    Promise.all([
      await this.savingNewScheduleMonths(theSchedule.id, reqBody.months),
      await this.savingNewScheduleSlots(theSchedule.id, reqBody.slots),
    ]);

    return await this.getByID(timezone, scheduleId);
  }

  async deleteByID(timezone, id: number): Promise<ScheduleSlotsDetailsDTO> {
    let deletedSchedle = await this.getByID(timezone, id);

    Promise.all([
      await this.deleteScheduleSlots(id),
      await this.deleteScheduleMonths(id),
    ]);

    // delete schedule
    await this.prisma.$queryRaw`
    DELETE
    FROM Schedule
    WHERE id = ${id}
  `;
    return deletedSchedle;
  }

  async deleteByTrainerProfileId(trainerProfileId: number) {
    let allTrainerProfileSchedules: ScheduleSlotsDetailsDTO[] = await this.prisma
      .$queryRaw`
      SELECT 
      *
      FROM
      Schedule
      WHERE
      trainerProfileId = ${trainerProfileId}
    `;

    for (let index = 0; index < allTrainerProfileSchedules.length; index++) {
      await this.deleteByID(null, allTrainerProfileSchedules[index].id);
    }
  }

  async allTrainerSchedulesMonths(trainerProfileId: number): Promise<number[]> {
    let allSchedulesMonths = await this.prisma.$queryRaw`
    SELECT
    JSON_ARRAYAGG(m.monthNumber) AS months
    FROM
    Schedule AS s
    JOIN SchedulesMonths AS sm
    ON s.id = sm.ScheduleId
    JOIN Month AS m
    ON sm.monthId = m.id
    WHERE s.trainerProfileId = ${trainerProfileId}
    `;

    return allSchedulesMonths[0].months;
  }

  async allTrainerSchedulesMonthsExceptOne(
    scheduleId,
    trainerProfileId: number,
  ): Promise<number[]> {
    let allSchedulesMonths = await this.prisma.$queryRaw`
    SELECT
    JSON_ARRAYAGG(m.monthNumber) AS months
    FROM
    Schedule AS s
    JOIN SchedulesMonths AS sm
    ON s.id = sm.ScheduleId
    JOIN Month AS m
    ON sm.monthId = m.id
    WHERE s.trainerProfileId = ${trainerProfileId}
    AND s.id <> ${scheduleId}
    `;

    return allSchedulesMonths[0].months;
  }

  async getTrainerFieldSlots(trainerProfileId: number, fieldId: number) {
    await this.checkTrainerProfileExistence(trainerProfileId);
    await this.checkFieldExistence(fieldId);
    let trainerFieldSlots = await this.prisma.$queryRaw`
    WITH TrainerNotAvailableDays AS (
      SELECT trainerProfileId,
      JSON_ARRAYAGG(DATE(dayDate)) AS dates
      FROM TrainerProfileNotAvailableDays
      WHERE trainerProfileId = ${trainerProfileId}
      GROUP BY trainerProfileId
    ),
    SchedulesMonths AS (
      SELECT Schedule.id AS scheduleId,
      Schedule.trainerProfileId AS trainerProfileId,
      CASE
      WHEN COUNT(Month.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'name',Month.monthName,
        'number', Month.monthNumber
        ))
      END AS months
      FROM Schedule
      LEFT JOIN SchedulesMonths ON SchedulesMonths.scheduleId = Schedule.id
      LEFT JOIN Month ON Month.id = SchedulesMonths.monthId
      WHERE Schedule.trainerProfileId = ${trainerProfileId}
      GROUP BY Schedule.id
    ),
    ScheduleWithSlots AS (
    SELECT
    Schedule.id AS scheduleId,
      Schedule.trainerProfileId AS trainerProfileId,
      SchedulesMonths.months AS months,
      CASE
      WHEN COUNT(Slot.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',Slot.id,
        'name',Slot.name,
        'fromTime', Slot.fromTime,
        'toTime', Slot.toTime,
        'cost', Slot.cost,
        'fieldId', Slot.fieldId,
        'weekDayNumber', Slot.weekDayNumber,
        'weekDayName', Slot.weekDayName
        ))
      END AS slots
      FROM Schedule
      LEFT JOIN Slot ON Slot.scheduleId = Schedule.id
      LEFT JOIN SchedulesMonths ON SchedulesMonths.scheduleId = Schedule.id
      WHERE Schedule.trainerProfileId = ${trainerProfileId}
      AND Slot.fieldId = ${fieldId}
      GROUP BY Schedule.id
    )
    SELECT
    TrainerProfile.id,
    (SELECT dates FROM TrainerNotAvailableDays) AS notAvailableDays,
    CASE
      WHEN COUNT(ScheduleWithSlots.scheduleId ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'scheduleId',ScheduleWithSlots.scheduleId,
        'months',ScheduleWithSlots.months,
        'slots', ScheduleWithSlots.slots
        ))
      END AS scheduleSlots
    FROM 
    TrainerProfile
    LEFT JOIN ScheduleWithSlots ON ScheduleWithSlots.trainerProfileId = TrainerProfile.id
    WHERE TrainerProfile.id = ${trainerProfileId}
    GROUP BY TrainerProfile.id
    `;

    return trainerFieldSlots[0];
  }

  async getSlotById(slotId): Promise<SlotDetailsDto> {
    let theSlot = await this.prisma.$queryRaw`
      SELECT *
      FROM Slot
      WHERE id = ${slotId}
    `;
    if (!theSlot[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.NOT_EXISTED_SLOT`, { lang: I18nContext.current().lang }),
      );
    }
    return theSlot[0];
  }

  async getBookedSessionBySlotId(slotId: number, dayDate: string) {
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

  async getBookedSessionsByScheduleId(scheduleId: number): Promise<any> {
    let scheduleSessions = await this.prisma.$queryRaw`
      SELECT JSON_ARRAYAGG(Slot.id) AS slotsIds
      FROM Schedule
      LEFT JOIN Slot ON Slot.scheduleId = Schedule.id
      WHERE Schedule.id = ${scheduleId}
    `;
    // if (!scheduleSessions[0]) {
    //   throw new NotFoundException(
    //     this.i18n.t(`errors.BOOKED_SESSION_NOT_FOUND`, {
    //       lang: I18nContext.current().lang,
    //     }),
    //   );
    // }
    return scheduleSessions;
  }

  async saveTrainerSessionRating(
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
    "trainer"
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

  async createNewSessionRequest(trainerBookedSessionId: number) {
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

  async getTrainerBookedSessionCard(trainerBookedSessionId: number) {
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

  private async checkTrainerProfileExistence(trainerProfileId: number) {
    let foundedTrainerProfile: ReturnTrainerProfileDto = await this.prisma.$queryRaw`
    SELECT *
    FROM TrainerProfile
    WHERE id = ${trainerProfileId};
    `;

    if (!foundedTrainerProfile[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.NOT_EXISTED_TRAINER_PROFILE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
    return true;
  }

  private async checkFieldExistence(fieldId: number) {
    let foundedField: FieldReturnDto = await this.prisma.$queryRaw`
    SELECT *
    FROM Field
    WHERE id = ${fieldId};
    `;

    if (!foundedField[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.NOT_EXISTED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }

  private async savingNewScheduleMonths(scheduleId: number, monthsArray: number[]) {
    if (monthsArray.length == 0) {
      return;
    }

    let schedulesMonthsArray = [];
    for (let i = 0; i < monthsArray.length; i++) {
      schedulesMonthsArray.push([scheduleId, monthsArray[i]]);
    }
    await this.prisma.$queryRaw`
    INSERT INTO SchedulesMonths
    (scheduleId,monthId)
    VALUES
    ${Prisma.join(schedulesMonthsArray.map((row) => Prisma.sql`(${Prisma.join(row)})`))}
    `;
  }

  private async savingNewScheduleSlots(scheduleId: number, slotsArray: SlotDetailsDto[]) {
    let momentDate = moment();
    let date = momentDate.format('YYYY-MM-DD');
    if (slotsArray.length == 0) {
      return;
    }
    let schedulesSlotsArray = [];
    for (let i = 0; i < slotsArray.length; i++) {
      schedulesSlotsArray.push([
        slotsArray[i].name,
        moment(`${date}T${slotsArray[i].fromTime}`).utc().format('HH:mmZ'),
        moment(`${date}T${slotsArray[i].toTime}`).utc().format('HH:mmZ'),
        slotsArray[i].cost,
        slotsArray[i].weekDayNumber,
        // slotsArray[i].weekDayName,
        this.globalSerice.getDayNameByNumber(slotsArray[i].weekDayNumber),
        slotsArray[i].fieldId,
        scheduleId,
      ]);
    }

    await this.prisma.$queryRaw`
    INSERT INTO Slot
    (name,
    fromTime,
    toTime,
    cost,
    weekDayNumber,
    weekDayName,
    fieldId,
    scheduleId)
    VALUES
    ${Prisma.join(schedulesSlotsArray.map((row) => Prisma.sql`(${Prisma.join(row)})`))}
    `;
  }

  private async deleteScheduleMonths(scheduleId: number) {
    await this.prisma.$queryRaw`
    DELETE
    FROM SchedulesMonths AS sm
    WHERE sm.scheduleId = ${scheduleId}
    `;
  }

  private async deleteScheduleSlots(scheduleId: number) {
    await this.prisma.$queryRaw`
    DELETE
    FROM Slot AS s
    WHERE s.scheduleId = ${scheduleId}
    `;
  }

  private timezonedSlots(timezone, scheduleSlots: []) {
    if (timezone == null) {
      timezone = 'Africa/Cairo';
    }
    if (!scheduleSlots || scheduleSlots.length == 0) {
      return [];
    }
    scheduleSlots.map((i: SlotDetailsDto) => {
      i.fromTime = this.globalSerice.getZoneTime24(timezone, i.fromTime);
      i.toTime = this.globalSerice.getZoneTime24(timezone, i.toTime);
      return i;
    });
    return scheduleSlots;
  }
}
