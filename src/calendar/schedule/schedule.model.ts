import { Injectable } from '@nestjs/common';
import { DatesCountTypeFilter } from './dto/dates-count-filters.dto';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HOME_SEARCH_TYPES_ENUM } from 'src/utils/enums';
import { DatesCountResultDto } from './dto/dates-count-result.dto';

@Injectable()
export class ScheduleModel {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
  ) {}

  private generateDatesCountQuery(
    type: DatesCountTypeFilter,
    userId: number,
    startDate: string,
    endDate: string,
  ) {
    let sql = `
      SELECT
        DATE( fromDateTime ) AS bookingDate,
        COUNT(*) AS bookedHoursCount 
      FROM 
    `;
    switch (type) {
      case HOME_SEARCH_TYPES_ENUM.COACHES:
        sql += ` TrainerProfileBookedHours `;
        break;
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        sql += ` DoctorClinicsBookedHours `;
        break;
      default:
        // Fields as default
        sql += ` FieldsBookedHours `;
        break;
    }
    sql += `
      WHERE
        userId = ${userId}
        AND DATE( fromDateTime ) BETWEEN '${startDate}' 
        AND '${endDate}' 
      GROUP BY
        DATE( fromDateTime ) 
      ORDER BY
        bookingDate;
    `;
    return this.globalService.preparePrismaSql(sql);
  }

  private generateDateSessionsQuery(
    type: DatesCountTypeFilter,
    userId: number,
    date: string,
  ) {
    let sql = null;
    switch (type) {
      case HOME_SEARCH_TYPES_ENUM.COACHES:
        sql = `
          SELECT
            cbh.id AS coachBookedHoursId,
            cbh.fromDateTime AS bookedHour,
            cbh.gmt AS gmt,
            tp.name AS name,
            tp.profileImage AS profileImage,
            r.name AS region,
            CASE
              WHEN COUNT( tps.sportId ) > 0 THEN
              JSON_ARRAYAGG(s.name) ELSE NULL 
            END AS sports 
          FROM
            TrainerProfileBookedHours cbh
            JOIN TrainerProfile tp ON cbh.trainerProfileId = tp.id
            LEFT JOIN Region r ON tp.regionId = r.id
            LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
            LEFT JOIN Sport s ON tps.sportId = s.id 
          WHERE
            cbh.userId = ${userId}
            AND DATE( cbh.fromDateTime ) = '${date}' 
          GROUP BY
            cbh.id;
        `;
        break;
      case HOME_SEARCH_TYPES_ENUM.DOCTORS:
        sql = `
          SELECT
            dbh.id AS doctorBookedHoursId,
            dbh.fromDateTime AS bookedHour,
            dbh.gmt AS gmt,
            dc.name AS name,
            dc.profileImage AS profileImage,
            r.name AS region,
            s.name AS specialization 
          FROM
            doctorclinicsbookedhours dbh
            JOIN doctorclinic dc ON dbh.doctorclinicId = dc.id
            LEFT JOIN region r ON dc.regionId = r.id
            LEFT JOIN doctorclinicspecialization s ON dc.doctorClinicSpecializationId = s.id 
          WHERE
            dbh.userId = ${userId} 
            AND DATE( dbh.fromDateTime ) = '${date}' 
          GROUP BY
            dbh.id;
        `;
        break;
      default:
        // Fields as default
        sql = `
          SELECT
            fbh.id AS fieldBookedHoursId,
            fbh.fromDateTime AS bookedHour,
            fbh.gmt AS gmt,
            f.name AS name,
            f.profileImage AS profileImage,
            r.name AS region,
            s.name AS sport 
          FROM
            fieldsbookedhours fbh
            JOIN field f ON fbh.fieldId = f.id
            LEFT JOIN region r ON f.regionId = r.id
            LEFT JOIN sport s ON f.sportId = s.id 
          WHERE
            fbh.userId = ${userId} 
            AND DATE( fbh.fromDateTime ) = '${date}' 
          GROUP BY
            fbh.id;
        `;
        break;
    }
    return this.globalService.preparePrismaSql(sql);
  }

  async getDoctorClinicDatesCount(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<DatesCountResultDto[]> {
    const preparedSql = this.generateDatesCountQuery(
      HOME_SEARCH_TYPES_ENUM.DOCTORS,
      userId,
      startDate,
      endDate,
    );
    return this.prisma.$queryRaw(preparedSql);
  }

  async getFieldsDatesCount(userId: number, startDate: string, endDate: string) {
    const preparedSql = this.generateDatesCountQuery(
      HOME_SEARCH_TYPES_ENUM.FIELDS,
      userId,
      startDate,
      endDate,
    );
    return this.prisma.$queryRaw(preparedSql);
  }

  async getCoachesDatesCount(userId: number, startDate: string, endDate: string) {
    const preparedSql = this.generateDatesCountQuery(
      HOME_SEARCH_TYPES_ENUM.COACHES,
      userId,
      startDate,
      endDate,
    );
    return this.prisma.$queryRaw(preparedSql);
  }

  async getDoctorClinicDateSessions(
    userId: number,
    date: string,
  ): Promise<DatesCountResultDto[]> {
    const preparedSql = this.generateDateSessionsQuery(
      HOME_SEARCH_TYPES_ENUM.DOCTORS,
      userId,
      date,
    );
    return this.prisma.$queryRaw(preparedSql);
  }

  async getTrainerProfileDateSessions(
    userId: number,
    date: string,
  ): Promise<DatesCountResultDto[]> {
    const preparedSql = this.generateDateSessionsQuery(
      HOME_SEARCH_TYPES_ENUM.COACHES,
      userId,
      date,
    );
    return this.prisma.$queryRaw(preparedSql);
  }

  async getFieldsDateSessions(
    userId: number,
    date: string,
  ): Promise<DatesCountResultDto[]> {
    const preparedSql = this.generateDateSessionsQuery(
      HOME_SEARCH_TYPES_ENUM.FIELDS,
      userId,
      date,
    );
    return this.prisma.$queryRaw(preparedSql);
  }
}
