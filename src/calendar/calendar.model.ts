import { Injectable } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DatesCountTypeFilter } from './dto/dates-count-filters.dto';
import { HOME_SEARCH_TYPES_ENUM, SESSIONS_STATUSES_ENUM } from 'src/global/enums';
import { DatesCountResultDto } from './dto/dates-count-result.dto';

@Injectable()
export class CalendarModel {
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
      case HOME_SEARCH_TYPES_ENUM.COACHES:
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
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
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
  ) {
    let sql = null;
    switch (type) {
      case HOME_SEARCH_TYPES_ENUM.COACHES:
        sql = `
          SELECT
            tbs.id AS coachBookedHoursId,
            NULL AS doctorBookedHoursId,
            NULL AS fieldBookedHoursId,
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
            '${HOME_SEARCH_TYPES_ENUM.COACHES}' AS type,
            NULL AS slotDuration,
            Slot.fromTime AS fromTime,
            Slot.toTime As toTime
          FROM
            TrainerBookedSession tbs
            JOIN TrainerProfile tp ON tbs.trainerProfileId = tp.id
            LEFT JOIN Region r ON tp.regionId = r.id
            LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
            LEFT JOIN Sport s ON tps.sportId = s.id
            LEFT JOIN User u ON tp.userId = u.id
            LEFT JOIN Slot ON Slot.id = tbs.slotId
          WHERE
            tbs.status = '${SESSIONS_STATUSES_ENUM.UPCOMING}'
            AND tbs.userId = ${userId} 
        `;
        if (date) {
          sql += ` AND DATE( tbs.date ) = '${date}' `;
        }
        sql += ` GROUP BY tbs.id `;
        if (addOrderBy) {
          sql += ` ORDER BY bookedHour `;
        }
        break;
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        sql = `
          SELECT
            NULL AS coachBookedHoursId,
            dbh.id AS doctorBookedHoursId,
            NULL AS fieldBookedHoursId,
            dbh.fromDateTime AS bookedHour,
            dbh.gmt AS gmt,
            dc.name AS name,
            dc.profileImage AS profileImage,
            r.name AS region,
            NULL AS sports,
            NULL AS sport,
            s.name AS specialization,
            '${HOME_SEARCH_TYPES_ENUM.DOCTORS}' AS type,
            dc.slotDuration AS slotDuration,
            NULL AS fromTime,
            NULL As toTime 
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
            NULL AS coachBookedHoursId,
            NULL AS doctorBookedHoursId,
            fbh.id AS fieldBookedHoursId,
            fbh.fromDateTime AS bookedHour,
            fbh.gmt AS gmt,
            f.name AS name,
            f.profileImage AS profileImage,
            r.name AS region,
            NULL AS sports,
            s.name AS sport,
            NULL AS specialization,
            '${HOME_SEARCH_TYPES_ENUM.FIELDS}' AS type,
            f.slotDuration AS slotDuration,
            NULL AS fromTime,
            NULL As toTime 
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
    ] = [
      this.generateDatesCountQuery(
        HOME_SEARCH_TYPES_ENUM.DOCTORS,
        userId,
        startDate,
        endDate,
      ),
      this.generateDatesCountQuery(
        HOME_SEARCH_TYPES_ENUM.FIELDS,
        userId,
        startDate,
        endDate,
      ),
      this.generateDatesCountQuery(
        HOME_SEARCH_TYPES_ENUM.COACHES,
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
          (${doctorCountRawSql} UNION ALL ${fieldCountRawSql} UNION ALL ${coachCountRawSql}) AS countResult
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
  ): Promise<DatesCountResultDto[]> {
    if (!types) {
      types = Object.values(HOME_SEARCH_TYPES_ENUM).filter(
        (homeSearchType) => homeSearchType !== HOME_SEARCH_TYPES_ENUM.ALL,
      ) as DatesCountTypeFilter[];
    }
    const selectRawSqlQueries = [];
    types.forEach((type: DatesCountTypeFilter) => {
      const { rawSql } = this.generateDateSessionsQuery(type, userId, date);
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
      HOME_SEARCH_TYPES_ENUM.DOCTORS,
      userId,
      date,
      true,
    );
    return this.prisma.$queryRaw(preparedSql);
  }

  async getTrainerProfileDateSessions(
    userId: number,
    date: string,
  ): Promise<DatesCountResultDto[]> {
    const { preparedSql } = this.generateDateSessionsQuery(
      HOME_SEARCH_TYPES_ENUM.COACHES,
      userId,
      date,
      true,
    );
    return this.prisma.$queryRaw(preparedSql);
  }

  async getFieldsDateSessions(
    userId: number,
    date: string,
  ): Promise<DatesCountResultDto[]> {
    const { preparedSql } = this.generateDateSessionsQuery(
      HOME_SEARCH_TYPES_ENUM.FIELDS,
      userId,
      date,
      true,
    );
    return this.prisma.$queryRaw(preparedSql);
  }
}
