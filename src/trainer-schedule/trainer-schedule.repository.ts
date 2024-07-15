import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ScheduleSlotsDetailsDTO } from './dtos/schedule-slots-details';
import { ScheduleCreateDto } from './dtos/create.dto';
import { ReturnScheduleDto } from './dtos/return.dto';
import moment from 'moment-timezone';
import { SlotDetailsDto } from './dtos/slot-details.dto';
import { FieldReturnDto } from 'src/field/dtos/return.dto';
import { ReturnTrainerProfileDto } from 'src/trainer-profile/dtos/return.dto';
import { SESSIONS_STATUSES_ENUM } from 'src/global/enums';
import { UserSlotState } from './dtos/user-slot-state.dto';
import { TrainerFieldSlots } from './dtos/trainer-field-slots.dto';
import { SessionDateTimeDto } from 'src/package/dtos/session-date-time.dto';

@Injectable()
export class TrainerScheduleRepository {
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
    LEFT JOIN MonthTranslation
    ON MonthTranslation.monthId = m.id
    AND MonthTranslation.language = ${I18nContext.current().lang}
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
    LEFT JOIN MonthTranslation
    ON MonthTranslation.monthId = m.id
    AND MonthTranslation.language = ${I18nContext.current().lang}
    WHERE sch.id = ${id}
    GROUP BY sch.id
    )
    SELECT
    swm.id,swm.trainerProfileId,swm.scheduleMonths,
    (
      SELECT
      cost
      FROM
      TrainerProfile
      WHERE id = swm.trainerProfileId
    ) AS trainerDefaultSlotCost,
    CASE
    WHEN COUNT(sl.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(JSON_OBJECT(
      'id',sl.id,
      'name',sl.name,
      'fromTime', sl.fromTime,
      'toTime', sl.toTime,
      'cost', sl.cost,
      'field', (
        SELECT JSON_OBJECT(
          'id',Field.id,
          'name',Field.name,
          'location',  MAX(RegionTranslation.name)
        )
        FROM Field
        LEFT JOIN Region ON Region.id = Field.regionId
        LEFT JOIN RegionTranslation AS RegionTranslation ON RegionTranslation.regionId = Region.id
        AND RegionTranslation.language = ${I18nContext.current().lang}
        WHERE Field.id = sl.fieldId
        ),
      'weekDayNumber', WeekDay.dayNumber,
      'weekDayName', WeekDayTranslation.dayName
      ))
    END AS ScheduleSlots
    FROM ScheduleWithMonths AS swm
    LEFT JOIN Slot AS sl
    LEFT JOIN WeekDay ON sl.weekDayId = WeekDay.id
      LEFT JOIN WeekDayTranslation
      ON WeekDayTranslation.weekDayId = WeekDay.id
      AND WeekDayTranslation.language = ${I18nContext.current().lang}
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

  async getUserBookedTimes(userId: number, date: string): Promise<UserSlotState[]> {
    let userBookedSlots = await this.prisma.$queryRaw`
    SELECT
    CASE WHEN COUNT(Slot.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'slotId',Slot.id,
        'fromTime', Slot.fromTime,
        'toTime',Slot.toTime,
        'status',True
        ))
      END AS times
    FROM
    TrainerBookedSession
    left join Slot on TrainerBookedSession.slotId = Slot.id
    where
    userId = ${userId}
    and
    status = ${SESSIONS_STATUSES_ENUM.ACTIVE}
    and date = ${date}

    `;

    return userBookedSlots[0].times ? userBookedSlots[0].times : [];
  }

  async getTrainerFieldSlots(
    trainerProfileId: number,
    fieldId: number,
  ): Promise<TrainerFieldSlots> {
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
        'name',MonthTranslation.monthName,
        'number', Month.monthNumber
        ))
      END AS months
      FROM Schedule
      LEFT JOIN SchedulesMonths ON SchedulesMonths.scheduleId = Schedule.id
      LEFT JOIN Month ON Month.id = SchedulesMonths.monthId
      LEFT JOIN MonthTranslation
      ON MonthTranslation.monthId = Month.id
      AND MonthTranslation.language = ${I18nContext.current().lang}
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
        'weekDayNumber', WeekDay.dayNumber,
        'weekDayName', WeekDayTranslation.dayName
        ))
      END AS slots
      FROM Schedule
      LEFT JOIN Slot ON Slot.scheduleId = Schedule.id
      LEFT JOIN WeekDay ON Slot.weekDayId = WeekDay.id
      LEFT JOIN WeekDayTranslation
      ON WeekDayTranslation.weekDayId = WeekDay.id
      AND WeekDayTranslation.language = ${I18nContext.current().lang}
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

  async getSlotById(slotId: number): Promise<SlotDetailsDto> {
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

  async getTrainerScheduleId(trainerProfileId: number): Promise<number> {
    let TheSchedule = await this.prisma.$queryRaw`
      SELECT
      id
      FROM
      Schedule
      WHERE
      trainerProfileId = ${trainerProfileId}
    `;

    if (!TheSchedule[0]) {
      throw new BadRequestException(
        this.i18n.t(`errors.TRAINER_HAS_NO_SCHEDULE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    return TheSchedule[0].id;
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

  async update(
    timezone,
    scheduleId: number,
    reqBody: ScheduleCreateDto,
  ): Promise<ScheduleSlotsDetailsDTO> {
    let theSchedule = await this.getByID(timezone, scheduleId);

    Promise.all([
      //delete past scheduleMonths
      await this.deleteScheduleMonths(scheduleId),

      //nullify or past scheduleSlots
      //we don't delete the slots in case of a trainerSession is booked in this slot, we only nullify scheduelId
      await this.deleteNotBookedScheduleSlots(scheduleId),
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
      await this.deleteNotBookedScheduleSlots(id),
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

  private async checkTrainerProfileExistence(trainerProfileId: number): Promise<boolean> {
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

  private async checkFieldExistence(fieldId: number): Promise<boolean> {
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
    let theSchedule = await this.getByID(null, scheduleId);

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
        slotsArray[i].cost ? slotsArray[i].cost : theSchedule.trainerDefaultSlotCost,
        await this.globalSerice.getIdByWeekDayNumber(slotsArray[i].weekDayNumber),
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
    weekDayId,
    fieldId,
    scheduleId)
    VALUES
    ${Prisma.join(schedulesSlotsArray.map((row) => Prisma.sql`(${Prisma.join(row)})`))}
    `;
  }

  async createPackageSlot(
    packageId,
    packageName,
    packagePrice,
    packageFieldId,
    packageSessionDateTime: SessionDateTimeDto,
  ): Promise<SlotDetailsDto> {
    let weekDay = moment(packageSessionDateTime.date).weekday();
    await this.prisma.$queryRaw`
      INSERT INTO Slot
      (name,
      fromTime,
      toTime,
      cost,
      weekDayId,
      fieldId,
      scheduleId,
      packageId)
      VALUES
      (
        ${packageName},
        ${packageSessionDateTime.fromTime},
        ${packageSessionDateTime.toTime},
        ${packagePrice},
        ${weekDay},
        ${packageFieldId},
        ${null},
        ${packageId}
      )
      `;

    let newSlot: SlotDetailsDto = await this.prisma.$queryRaw`
      SELECT
        id,name,fromTime,toTime,cost,weekDayNumber,weekDayName,fieldId,scheduleId,packageId
      FROM Slot
      WHERE
      id = LAST_INSERT_ID()
      `;

    return newSlot;
  }

  private async deleteScheduleMonths(scheduleId: number) {
    await this.prisma.$queryRaw`
    DELETE
    FROM SchedulesMonths AS sm
    WHERE sm.scheduleId = ${scheduleId}
    `;
  }

  private async deleteNotBookedScheduleSlots(scheduleId: number) {
    //get schedule slot ids
    let allSlotsIds: any[] = await this.prisma.$queryRaw`
    SELECT
    JSON_ARRAYAGG(id) as ids
    FROM
    Slot
    WHERE
    scheduleId = ${scheduleId}
    `;

    // get ids of booked slots
    if (allSlotsIds[0].ids) {
      let bookedSlotsIds: any = await this.prisma.$queryRaw`
      SELECT
      JSON_ARRAYAGG(slotId) as ids
      FROM
      TrainerBookedSession
      WHERE
      slotId IN (${Prisma.join(allSlotsIds[0].ids)})
      `;

      // get not booked slotIds
      let notBookedSlotsIds = allSlotsIds[0].ids.filter(
        (element) => !bookedSlotsIds[0].ids?.includes(element),
      );

      //delete the rest of slots (whose don't connect to a trainerBookedSession)

      if (notBookedSlotsIds?.length > 0) {
        await this.prisma.$queryRaw`
        DELETE
        FROM Slot AS s
        WHERE s.id IN(${Prisma.join(notBookedSlotsIds)})
        `;
      }
    }
  }

  private timezonedSlots(timezone, scheduleSlots: []): SlotDetailsDto[] {
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
