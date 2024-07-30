import { Injectable } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DatesCountTypeFilter } from './dto/dates-count-filters.dto';
import { SESSIONS_STATUSES_ENUM } from 'src/global/enums';
import { DatesCountResultDto } from './dto/dates-count-result.dto';
import { CALENDAR_TYPES_ENUM } from './dto/calendar-types.enum';

@Injectable()
export class CalendarRepository {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
  ) {}

  private generateDatesCountQuery(
    type: DatesCountTypeFilter,
    userId: number,
    startDate: string,
    endDate: string,
    addOrderBy: boolean = false,
  ) {
    let sql = ``;
    switch (type) {
      case CALENDAR_TYPES_ENUM.PLAYERS:
        sql += `
          SELECT
            DATE( date ) AS bookingDate,
            COUNT(*) AS bookedHoursCount 
          FROM TrainerBookedSession 
          WHERE
            userId = ${userId}
            AND DATE( date ) BETWEEN '${startDate}' 
            AND '${endDate}' 
          GROUP BY
            DATE( date )
          `;
        break;
      case CALENDAR_TYPES_ENUM.COACHES:
        sql += `
          SELECT
            DATE( date ) AS bookingDate,
            COUNT(*) AS bookedHoursCount 
          FROM TrainerBookedSession tbs
          JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
          WHERE
            tp.userId = ${userId}
            AND DATE( date ) BETWEEN '${startDate}' 
            AND '${endDate}' 
          GROUP BY
            DATE( date )
          `;
        break;
      case CALENDAR_TYPES_ENUM.DOCTORS:
        sql += `
          SELECT
            DATE( fromDateTime ) AS bookingDate,
            COUNT(*) AS bookedHoursCount 
          FROM DoctorClinicsBookedHours 
          WHERE
            userId = ${userId}
            AND DATE( fromDateTime ) BETWEEN '${startDate}' 
            AND '${endDate}' 
          GROUP BY
            DATE( fromDateTime )
        `;
        break;
      default:
        // Fields as default
        sql += `
          SELECT
            DATE( fromDateTime ) AS bookingDate,
            COUNT(*) AS bookedHoursCount 
          FROM FieldsBookedHours 
          WHERE
            userId = ${userId}
            AND DATE( fromDateTime ) BETWEEN '${startDate}' 
            AND '${endDate}' 
          GROUP BY
            DATE( fromDateTime )
         `;
        break;
    }
    if (addOrderBy) {
      sql += ' ORDER BY bookingDate ';
    }
    return {
      preparedSql: this.globalService.preparePrismaSql(sql),
      rawSql: sql,
    };
  }

  private generateDateSessionsQuery(
    type: DatesCountTypeFilter,
    userId: number,
    date: string,
    addOrderBy: boolean = false,
    status: SESSIONS_STATUSES_ENUM | undefined = undefined,
    fieldId: number | undefined = undefined,
  ) {
    let sql = null;
    switch (type) {
      case CALENDAR_TYPES_ENUM.PLAYERS:
        sql = `
          SELECT
            tbs.userId AS userId,
            tbs.id AS id,
            tbs.date AS bookedHour,
            tbs.gmt AS gmt,
            u.firstName AS NAME,
            u.profileImage AS profileImage,
            r.NAME AS region,
            CASE
              WHEN COUNT( tps.sportId ) > 0 THEN
              JSON_ARRAYAGG( s.NAME ) ELSE NULL 
            END AS sports,
            NULL AS sport,
            NULL AS specialization,
            '${CALENDAR_TYPES_ENUM.PLAYERS}' AS type,
            NULL AS slotDuration,
            Slot.fromTime AS fromTime,
            Slot.toTime As toTime,
            f.name AS sessionField 
          FROM
            TrainerBookedSession tbs
            JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
            LEFT JOIN Region r ON tp.regionId = r.id
            LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
            LEFT JOIN Sport s ON tps.sportId = s.id
            LEFT JOIN User u ON tp.userId = u.id
            LEFT JOIN Slot ON Slot.id = tbs.slotId
            LEFT JOIN Field f ON Slot.fieldId = f.id
          WHERE
            tbs.status = '${SESSIONS_STATUSES_ENUM.ACTIVE}'
            AND tbs.userId = ${userId} 
        `;
        if (status) {
          sql += ` AND tbs.status = '${status}' `;
        }
        if (date) {
          sql += ` AND DATE( tbs.date ) = '${date}' `;
        }
        if (fieldId) {
          sql += ` AND Slot.fieldId = '${fieldId}' `;
        }
        sql += ` GROUP BY tbs.id `;
        if (addOrderBy) {
          sql += ` ORDER BY bookedHour `;
        }
        break;
      case CALENDAR_TYPES_ENUM.COACHES:
        sql = `
          SELECT
            tbs.id AS id,
            tbs.date AS bookedHour,
            tbs.gmt AS gmt,
            u.firstName AS NAME,
            u.profileImage AS profileImage,
            r.NAME AS region,
            CASE
              WHEN COUNT( tps.sportId ) > 0 THEN
              JSON_ARRAYAGG( s.NAME ) ELSE NULL 
            END AS sports,
            NULL AS sport,
            NULL AS specialization,
            '${CALENDAR_TYPES_ENUM.COACHES}' AS type,
            NULL AS slotDuration,
            Slot.fromTime AS fromTime,
            Slot.toTime As toTime,
            f.name AS sessionField 
          FROM
            TrainerBookedSession tbs
            JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
            LEFT JOIN Region r ON tp.regionId = r.id
            LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
            LEFT JOIN Sport s ON tps.sportId = s.id
            LEFT JOIN User u ON tp.userId = u.id
            LEFT JOIN Slot ON Slot.id = tbs.slotId
            LEFT JOIN Field f ON Slot.fieldId = f.id
          WHERE
            tp.userId = ${userId}
            AND tbs.status = '${SESSIONS_STATUSES_ENUM.ACTIVE}'
        `;
        if (status) {
          sql += ` AND tbs.status = '${status}' `;
        }
        if (date) {
          sql += ` AND DATE( tbs.date ) = '${date}' `;
        }
        if (fieldId) {
          sql += ` AND Slot.fieldId = '${fieldId}' `;
        }
        sql += ` GROUP BY tbs.id `;
        if (addOrderBy) {
          sql += ` ORDER BY bookedHour `;
        }
        break;
      case CALENDAR_TYPES_ENUM.DOCTORS:
        sql = `
          SELECT
            dbh.id AS id,
            dbh.fromDateTime AS bookedHour,
            dbh.gmt AS gmt,
            dc.name AS name,
            dc.profileImage AS profileImage,
            r.name AS region,
            NULL AS sports,
            NULL AS sport,
            s.name AS specialization,
            '${CALENDAR_TYPES_ENUM.DOCTORS}' AS type,
            dc.slotDuration AS slotDuration,
            NULL AS fromTime,
            NULL As toTime,
            NULL AS sessionField 
          FROM
            DoctorClinicsBookedHours dbh
            JOIN DoctorClinic dc ON dbh.doctorClinicId = dc.id
            LEFT JOIN Region r ON dc.regionId = r.id
            LEFT JOIN DoctorClinicSpecialization s ON dc.doctorClinicSpecializationId = s.id 
          WHERE
            dbh.userId = ${userId} 
        `;
        if (date) {
          sql += ` AND DATE( dbh.fromDateTime ) = '${date}' `;
        }
        if (addOrderBy) {
          sql += ` ORDER BY bookedHour `;
        }
        break;
      default:
        // Fields as default
        sql = `
          SELECT
            fbh.id AS id,
            fbh.fromDateTime AS bookedHour,
            fbh.gmt AS gmt,
            f.name AS name,
            f.profileImage AS profileImage,
            r.name AS region,
            NULL AS sports,
            s.name AS sport,
            NULL AS specialization,
            '${CALENDAR_TYPES_ENUM.FIELDS}' AS type,
            f.slotDuration AS slotDuration,
            NULL AS fromTime,
            NULL As toTime,
            NULL AS sessionField 
          FROM
            FieldsBookedHours fbh
            JOIN Field f ON fbh.fieldId = f.id
            LEFT JOIN Region r ON f.regionId = r.id
            LEFT JOIN Sport s ON f.sportId = s.id 
          WHERE
            fbh.userId = ${userId} 
        `;
        if (date) {
          sql += ` AND DATE( fbh.fromDateTime ) = '${date}' `;
        }
        if (addOrderBy) {
          sql += ` ORDER BY bookedHour `;
        }
        break;
    }
    return {
      preparedSql: this.globalService.preparePrismaSql(sql),
      rawSql: sql,
    };
  }

  async getAllDatesCount(userId: number, startDate: string, endDate: string) {
    const [
      { rawSql: doctorCountRawSql },
      { rawSql: fieldCountRawSql },
      { rawSql: coachCountRawSql },
      { rawSql: playerCountRawSql },
    ] = [
      this.generateDatesCountQuery(
        CALENDAR_TYPES_ENUM.DOCTORS,
        userId,
        startDate,
        endDate,
      ),
      this.generateDatesCountQuery(
        CALENDAR_TYPES_ENUM.FIELDS,
        userId,
        startDate,
        endDate,
      ),
      this.generateDatesCountQuery(
        CALENDAR_TYPES_ENUM.COACHES,
        userId,
        startDate,
        endDate,
      ),
      this.generateDatesCountQuery(
        CALENDAR_TYPES_ENUM.PLAYERS,
        userId,
        startDate,
        endDate,
      ),
    ];
    const unionCountQuery = this.globalService.preparePrismaSql(
      `
        SELECT
          bookingDate, SUM(bookedHoursCount) AS bookedHoursCount
        FROM
          (${doctorCountRawSql} UNION ALL ${fieldCountRawSql} UNION ALL ${playerCountRawSql} UNION ALL ${coachCountRawSql}) AS countResult
        GROUP BY
          bookingDate
        ORDER BY
          bookingDate;
      `,
    );
    return this.prisma.$queryRaw(unionCountQuery);
  }

  async getMultiDateSessions(
    types: DatesCountTypeFilter[] | undefined,
    userId: number,
    date: string,
    limit: number,
    status: SESSIONS_STATUSES_ENUM | undefined = undefined,
    fieldId: number | undefined = undefined,
  ): Promise<DatesCountResultDto[]> {
    if (!types) {
      types = Object.values(CALENDAR_TYPES_ENUM) as DatesCountTypeFilter[];
    }
    const selectRawSqlQueries = [];
    types.forEach((type: DatesCountTypeFilter) => {
      const { rawSql } = this.generateDateSessionsQuery(
        type,
        userId,
        date,
        false,
        status,
        fieldId,
      );
      selectRawSqlQueries.push(rawSql);
    });
    const selectRawSqlQueriesLength = selectRawSqlQueries.length - 1;
    let unionSelectQuery = `SELECT * from (
        ${selectRawSqlQueries
          .map((query, index) =>
            index === selectRawSqlQueriesLength ? query : `${query} UNION ALL `,
          )
          .join(' ')}
      ) AS result ORDER BY bookedHour `;
    if (!date) {
      unionSelectQuery += ` LIMIT ${limit} `;
    }
    return this.prisma.$queryRaw(this.globalService.preparePrismaSql(unionSelectQuery));
  }

  async getDoctorClinicDateSessions(
    userId: number,
    date: string,
  ): Promise<DatesCountResultDto[]> {
    const { preparedSql } = this.generateDateSessionsQuery(
      CALENDAR_TYPES_ENUM.DOCTORS,
      userId,
      date,
      true,
    );
    return this.prisma.$queryRaw(preparedSql);
  }

  async getCoachSessions(
    userId: number,
    date: string,
    status: SESSIONS_STATUSES_ENUM,
    fieldId: number,
  ): Promise<DatesCountResultDto[]> {
    const { preparedSql } = this.generateDateSessionsQuery(
      CALENDAR_TYPES_ENUM.COACHES,
      userId,
      date,
      true,
      status,
      fieldId,
    );
    return this.prisma.$queryRaw(preparedSql);
  }

  async getPlayerDateSessions(
    userId: number,
    date: string,
    status: SESSIONS_STATUSES_ENUM,
    fieldId: number,
  ): Promise<DatesCountResultDto[]> {
    const { preparedSql } = this.generateDateSessionsQuery(
      CALENDAR_TYPES_ENUM.PLAYERS,
      userId,
      date,
      true,
      status,
      fieldId,
    );
    return this.prisma.$queryRaw(preparedSql);
  }

  async getFieldsDateSessions(
    userId: number,
    date: string,
  ): Promise<DatesCountResultDto[]> {
    const { preparedSql } = this.generateDateSessionsQuery(
      CALENDAR_TYPES_ENUM.FIELDS,
      userId,
      date,
      true,
    );
    return this.prisma.$queryRaw(preparedSql);
  }
}
