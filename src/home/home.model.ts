import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { GlobalService } from 'src/global/global.service';
import { RATEABLE_TYPES_ENUM } from 'src/utils/enums';
import { CoachResultDto, DoctorResultDto, FieldResultDto } from './dto/search-result.dto';

@Injectable()
export class HomeModel {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
  ) {}

  async getCoaches(filters: SearchFiltersDto): Promise<CoachResultDto[]> {
    /**
     * DISTINCT with 10.4 and earlier versions not supported
     * JSON_ARRAYAGG(DISTINCT JSON_OBJECT( 'id', s.id, 'name', s.name ))
     */
    let sql = `
      SELECT
        tp.id AS trainerProfileId,
        Region.name AS region,
        ROUND( IFNULL( SUM( r.ratingNumber ) / COUNT( r.id ), 0 ), 1 ) AS actualAverageRating,
        IFNULL( CEIL( SUM( r.ratingNumber ) / COUNT( r.id )), 0 ) AS roundedAverageRating,
      CASE
          WHEN COUNT( tps.sportId ) > 0 THEN
          JSON_ARRAYAGG(DISTINCT JSON_OBJECT( 'id', s.id, 'name', s.name ))
          ELSE NULL 
        END AS sports 
      FROM
        TrainerProfile tp
        LEFT JOIN Rate r ON tp.id = r.trainerProfileId AND R.rateableType = '${RATEABLE_TYPES_ENUM.TRAINER}'
        LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
        LEFT JOIN Sport s ON tps.sportId = s.id
        LEFT JOIN Region ON Region.id = tp.regionId
      WHERE
        1 = 1 `;
    if (filters.area) {
      sql += ` AND tp.regionId = ${filters.area} `;
    }
    if (filters.sport) {
      /**
       * If you need to return all player sports while filtering with sport
      // sql += ` AND EXISTS (
      //           SELECT 1
      //           FROM 
      //               trainerProfileSports
      //           WHERE 
      //               trainerProfileSports.trainerProfileId = tp.id AND trainerProfileSports.sportId = ${filters.sport}
      //         )`;
       */
      sql += ` AND tps.sportId = ${filters.sport} `;
    }
    sql += ` GROUP BY tp.id `;
    if (filters.rate) {
      sql += ` HAVING RoundedAverageRating = ${filters.rate} `;
    }
    sql += ` LIMIT ${filters.pageSize} OFFSET ${filters.offset};`;
    const coaches: CoachResultDto[] = await this.prisma.$queryRaw(
      this.globalService.preparePrismaSql(sql),
    );
    return coaches.map((coach) => ({
      ...coach,
      sports: this.globalService.safeParse(coach.sports),
    }));
  }

  async getDoctors(filters: SearchFiltersDto): Promise<DoctorResultDto[]> {
    let sql = `
      SELECT
        dc.id AS doctorClinicId,
        dc.profileImage AS profileImage,
        dcs.name AS specialization,
        Region.name AS region,
        dc.name AS name,
        dc.cost AS cost,
        ROUND( IFNULL( SUM( R.ratingNumber ) / COUNT( R.id ), 0 ), 1 ) AS ActualAverageRating,
        IFNULL( CEIL( SUM( R.ratingNumber ) / COUNT( R.id )), 0 ) AS RoundedAverageRating
      FROM
        DoctorClinic AS dc
        LEFT JOIN Rate R ON dc.id = R.doctorClinicId AND R.rateableType = '${RATEABLE_TYPES_ENUM.DOCTOR_CLINIC}'
        LEFT JOIN DoctorClinicSpecialization dcs ON dc.doctorClinicSpecializationId = dcs.id
        LEFT JOIN Region ON Region.id = dc.regionId
      WHERE
        1 = 1
    `;
    if (filters.area) {
      sql += ` AND dc.regionId = ${filters.area} `;
    }
    if (filters.specialization) {
      sql += ` AND dc.doctorClinicSpecializationId = ${filters.specialization} `;
    }
    sql += ` GROUP BY dc.id `;
    if (filters.rate) {
      sql += ` HAVING RoundedAverageRating = ${filters.rate} `;
    }
    sql += ` LIMIT ${filters.pageSize} OFFSET ${filters.offset};`;
    return this.prisma.$queryRaw(this.globalService.preparePrismaSql(sql));
  }

  async getFields(filters: SearchFiltersDto): Promise<FieldResultDto[]> {
    let sql = `
      SELECT
        f.id AS fieldId,
        f.profileImage AS profileImage,
        Region.name AS region,
        f.name AS name,
        f.cost AS cost,
        s.name AS sport,
        ROUND( IFNULL( SUM( R.ratingNumber ) / COUNT( R.id ), 0 ), 1 ) AS ActualAverageRating,
        IFNULL( CEIL( SUM( R.ratingNumber ) / COUNT( R.id )), 0 ) AS RoundedAverageRating
      FROM
        Field AS f
        LEFT JOIN Rate R ON f.id = R.fieldId AND R.rateableType = ${RATEABLE_TYPES_ENUM.FIELD}
        LEFT JOIN Sport s ON f.sportId = s.id
        LEFT JOIN Region ON Region.id = f.regionId
      WHERE
        1 = 1
    `;
    if (filters.area) {
      sql += ` AND f.regionId = ${filters.area} `;
    }
    if (filters.sport) {
      sql += ` AND f.sport = ${filters.sport} `;
    }
    sql += ` GROUP BY f.id `;
    if (filters.rate) {
      sql += ` HAVING RoundedAverageRating = ${filters.rate} `;
    }
    sql += ` LIMIT ${filters.pageSize} OFFSET ${filters.offset};`;
    return this.prisma.$queryRaw(this.globalService.preparePrismaSql(sql));
  }
}
