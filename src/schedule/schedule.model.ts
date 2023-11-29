import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { ScheduleSlotsDetailsDTO } from './dtos/schedule-slots-details';
import { ScheduleCreateDto } from './dtos/create.dto';
import { ReturnScheduleDto } from './dtos/return.dto';
import * as moment from 'moment-timezone';
import { SlotDetailsDto } from './dtos/slot-details.dto';

@Injectable()
export class ScheduleModel {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
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

    await this.savingNewScheduleMonths(newSchedule.id, reqBody.months);
    await this.savingNewScheduleSlots(newSchedule.id, reqBody.slots);
    return await this.getByID(timezone, newSchedule.id);
  }

  async update(timezone, scheduleId: number, reqBody: ScheduleCreateDto) {
    let theSchedule = await this.getByID(timezone, scheduleId);

    //delete past scheduleMonths
    await this.deleteScheduleMonths(scheduleId);

    //delete past scheduleSlots
    await this.deleteScheduleSlots(scheduleId);

    await this.savingNewScheduleMonths(theSchedule.id, reqBody.months);
    await this.savingNewScheduleSlots(theSchedule.id, reqBody.slots);

    return await this.getByID(timezone, scheduleId);
  }

  async deleteByID(timezone, id: number): Promise<ScheduleSlotsDetailsDTO> {
    let deletedSchedle = await this.getByID(timezone, id);

    await this.prisma.$queryRaw`
    DELETE
    FROM Slot
    WHERE scheduleId = ${id}
    `;

    // delete schedule months
    await this.prisma.$queryRaw`
    DELETE
    FROM SchedulesMonths
    WHERE scheduleId = ${id}
    `;

    // delete schedule
    await this.prisma.$queryRaw`
    DELETE
    FROM Schedule
    WHERE id = ${id}
  `;
    return deletedSchedle;
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
        this.globalSerice.getDayNameByNumber(parseInt(slotsArray[i].weekDayNumber)),
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
