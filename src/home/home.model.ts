import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { GlobalService } from 'src/global/global.service';
import { ACCEPTANCE_STATUSES_ENUM, RATEABLE_TYPES_ENUM } from 'src/global/enums';
import { SearchResultDto, SearchResultsDto } from './dto/search-result.dto';

@Injectable()
export class HomeModel {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
  ) {}

  generateCoachesQuery(filters: SearchFiltersDto) {
    const selectSqlPrefix = `
      SELECT
        NULL AS doctorClinicId,
        NULL AS fieldId,
        tp.id AS trainerProfileId,
        u.profileImage AS profileImage,
        NULL AS specialization,
        Region.name AS region,
        u.firstName AS name,
        tp.cost AS cost,
        NULL AS sport,
        CASE
          WHEN COUNT( tps.sportId ) > 0 THEN
          JSON_ARRAYAGG(s.name)
          ELSE NULL 
        END AS sports,
        ROUND( IFNULL( SUM( r.ratingNumber ) / COUNT( r.id ), 5 ), 1 ) AS actualAverageRating,
        IFNULL( CEIL( SUM( r.ratingNumber ) / COUNT( r.id )), 5 ) AS roundedAverageRating,
        tp.createdAt AS createdAt  
    `;
    const countSqlPrefix = `SELECT COUNT(DISTINCT tp.id) AS count, IFNULL( CEIL( SUM( r.ratingNumber ) / COUNT( r.id )), 5 ) AS RoundedAverageRating `;
    let sql = `
      FROM
        TrainerProfile tp
        LEFT JOIN Rate r ON tp.id = r.trainerProfileId AND r.rateableType = '${RATEABLE_TYPES_ENUM.TRAINER}'
        LEFT JOIN TrainerProfileSports tps ON tp.id = tps.trainerProfileId
        LEFT JOIN Sport s ON tps.sportId = s.id
        LEFT JOIN Region ON Region.id = tp.regionId
        LEFT JOIN User u ON u.id = tp.userId
      WHERE
        1 = 1
    `;
    /**
     * There is no field in trainerProfile added called `acceptanceStatus` as in doctor and field
     * WHERE
        tp.acceptanceStatus = '${ACCEPTANCE_STATUSES_ENUM.ACCEPTED}'
     */
    if (filters.name) {
      sql += ` AND u.firstName LIKE '%${filters.name}%' `;
    }
    if (filters.area) {
      sql += ` AND tp.regionId = ${filters.area} `;
    }
    if (filters.sport) {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM 
          TrainerProfileSports
          WHERE 
          TrainerProfileSports.trainerProfileId = tp.id AND TrainerProfileSports.sportId = ${filters.sport}
        )`;
    }
    let selectQuery = `${selectSqlPrefix} ${sql} GROUP BY tp.id`;
    let countQuery = `${countSqlPrefix} ${sql} `;
    if (filters.rate) {
      selectQuery += ` HAVING RoundedAverageRating = ${filters.rate} `;
      countQuery = `
        SELECT * FROM (${countQuery}) AS aggregatedData WHERE RoundedAverageRating = ${filters.rate}
      `;
    }
    const selectSql = this.globalService.preparePrismaSql(
      `${selectQuery} LIMIT ${filters.limit} OFFSET ${filters.offset};`,
    );
    // const selectSqlWithoutLimit = this.globalService.preparePrismaSql(`${selectQuery};`);
    const countSql = this.globalService.preparePrismaSql(`${countQuery};`);
    return {
      countSql,
      selectSql,
      selectSqlWithoutLimit: selectQuery,
      countRawSql: countQuery,
    };
  }

  generateDoctorQuery(filters: SearchFiltersDto) {
    const selectSqlPrefix = `
      SELECT
        dc.id AS doctorClinicId,
        NULL AS fieldId,
        NULL AS trainerProfileId,
        dc.profileImage AS profileImage,
        dcs.name AS specialization,
        Region.name AS region,
        dc.name AS name,
        dc.cost AS cost,
        NULL AS sport,
        NULL AS sports,
        ROUND( IFNULL( SUM( R.ratingNumber ) / COUNT( R.id ), 5 ), 1 ) AS ActualAverageRating,
        IFNULL( CEIL( SUM( R.ratingNumber ) / COUNT( R.id )), 5 ) AS RoundedAverageRating,
        dc.createdAt AS createdAt 
    `;
    const countSqlPrefix = `SELECT COUNT(DISTINCT dc.id) AS count, IFNULL( CEIL( SUM( R.ratingNumber ) / COUNT( R.id )), 5 ) AS RoundedAverageRating `;
    let sql = `
      FROM
        DoctorClinic AS dc
        LEFT JOIN Rate R ON dc.id = R.doctorClinicId AND R.rateableType = '${RATEABLE_TYPES_ENUM.DOCTOR_CLINIC}'
        LEFT JOIN DoctorClinicSpecialization dcs ON dc.doctorClinicSpecializationId = dcs.id
        LEFT JOIN Region ON Region.id = dc.regionId
      WHERE
        dc.acceptanceStatus = '${ACCEPTANCE_STATUSES_ENUM.ACCEPTED}'
    `;
    if (filters.name) {
      sql += ` AND dc.name LIKE '%${filters.name}%' `;
    }
    if (filters.area) {
      sql += ` AND dc.regionId = ${filters.area} `;
    }
    if (filters.specialization) {
      sql += ` AND dc.doctorClinicSpecializationId = ${filters.specialization} `;
    }
    let selectQuery = `${selectSqlPrefix} ${sql} GROUP BY dc.id`;
    let countQuery = `${countSqlPrefix} ${sql} `;
    if (filters.rate) {
      selectQuery += ` HAVING RoundedAverageRating = ${filters.rate} `;
      countQuery = `
        SELECT * FROM (${countQuery}) AS aggregatedData WHERE RoundedAverageRating = ${filters.rate}
      `;
    }
    const selectSql = this.globalService.preparePrismaSql(
      `${selectQuery} LIMIT ${filters.limit} OFFSET ${filters.offset};`,
    );
    // const selectSqlWithoutLimit = this.globalService.preparePrismaSql(`${selectQuery};`);
    const countSql = this.globalService.preparePrismaSql(`${countQuery};`);
    return {
      countSql,
      selectSql,
      selectSqlWithoutLimit: selectQuery,
      countRawSql: countQuery,
    };
  }

  generateFieldsQuery(filters: SearchFiltersDto) {
    const selectSqlPrefix = `
      SELECT
        NULL AS doctorClinicId,
        f.id AS fieldId,
        NULL AS trainerProfileId,
        f.profileImage AS profileImage,
        NULL AS specialization,
        Region.name AS region,
        f.name AS name,
        f.cost AS cost,
        s.name AS sport,
        NULL AS sports,
        ROUND( IFNULL( SUM( R.ratingNumber ) / COUNT( R.id ), 5 ), 1 ) AS ActualAverageRating,
        IFNULL( CEIL( SUM( R.ratingNumber ) / COUNT( R.id )), 5 ) AS RoundedAverageRating,
        f.createdAt AS createdAt 
    `;
    const countSqlPrefix = `SELECT COUNT(DISTINCT f.id) AS count, IFNULL( CEIL( SUM( R.ratingNumber ) / COUNT( R.id )), 5 ) AS RoundedAverageRating `;
    let sql = `
      FROM
        Field AS f
        LEFT JOIN Rate R ON f.id = R.fieldId AND R.rateableType = '${RATEABLE_TYPES_ENUM.FIELD}'
        LEFT JOIN Sport s ON f.sportId = s.id
        LEFT JOIN Region ON Region.id = f.regionId
      WHERE
        f.acceptanceStatus = '${ACCEPTANCE_STATUSES_ENUM.ACCEPTED}'
    `;
    if (filters.name) {
      sql += ` AND f.name LIKE '%${filters.name}%' `;
    }
    if (filters.area) {
      sql += ` AND f.regionId = ${filters.area} `;
    }
    if (filters.sport) {
      sql += ` AND f.sportId = ${filters.sport} `;
    }
    let selectQuery = `${selectSqlPrefix} ${sql} GROUP BY f.id`;
    let countQuery = `${countSqlPrefix} ${sql} `;
    if (filters.rate) {
      selectQuery += ` HAVING RoundedAverageRating = ${filters.rate} `;
      countQuery = `
        SELECT * FROM (${countQuery}) AS aggregatedData WHERE RoundedAverageRating = ${filters.rate}
      `;
    }
    // const selectSqlWithoutLimit = this.globalService.preparePrismaSql(`${selectQuery};`);
    const selectSql = this.globalService.preparePrismaSql(
      `${selectQuery} LIMIT ${filters.limit} OFFSET ${filters.offset};`,
    );
    const countSql = this.globalService.preparePrismaSql(`${countQuery};`);
    return {
      countSql,
      selectSql,
      selectSqlWithoutLimit: selectQuery,
      countRawSql: countQuery,
    };
  }

  async getCoaches(filters: SearchFiltersDto): Promise<SearchResultsDto> {
    const { selectSql, countSql } = this.generateCoachesQuery(filters);
    const [searchResults, countResult] = await Promise.all([
      this.prisma.$queryRaw(selectSql),
      this.prisma.$queryRaw(countSql),
    ]);
    const { count } =
      Array.isArray(countResult) && countResult.length ? countResult[0] : { count: 0 };
    return {
      searchResults: (searchResults as SearchResultDto[]).map((coach) => {
        let sports = coach.sports && this.globalService.safeParse(coach.sports);
        if (Array.isArray(sports) && sports.length) {
          sports = [...new Set(sports)];
        }
        return {
          ...coach,
          sports,
        };
      }),
      count: parseInt(count) as number,
    };
  }

  async getDoctors(filters: SearchFiltersDto): Promise<SearchResultsDto> {
    const { selectSql, countSql } = this.generateDoctorQuery(filters);
    const [searchResults, countResult] = await Promise.all([
      this.prisma.$queryRaw(selectSql),
      this.prisma.$queryRaw(countSql),
    ]);
    const { count } =
      Array.isArray(countResult) && countResult.length ? countResult[0] : { count: 0 };
    return {
      searchResults: searchResults as SearchResultDto[],
      count: parseInt(count) as number,
    };
  }

  async getFields(filters: SearchFiltersDto): Promise<SearchResultsDto> {
    const { countSql, selectSql } = this.generateFieldsQuery(filters);
    const [searchResults, countResult] = await Promise.all([
      this.prisma.$queryRaw(selectSql),
      this.prisma.$queryRaw(countSql),
    ]);
    const { count } =
      Array.isArray(countResult) && countResult.length ? countResult[0] : { count: 0 };
    return {
      searchResults: searchResults as SearchResultDto[],
      count: parseInt(count) as number,
    };
  }

  async getAll(filters: SearchFiltersDto): Promise<SearchResultsDto> {
    const [
      { selectSqlWithoutLimit: doctorQuery, countRawSql: doctorCountRawSql },
      { selectSqlWithoutLimit: fieldQuery, countRawSql: fieldCountRawSql },
      { selectSqlWithoutLimit: coachQuery, countRawSql: coachCountRawSql },
    ] = [
      this.generateDoctorQuery(filters),
      this.generateFieldsQuery(filters),
      this.generateCoachesQuery(filters),
    ];
    const unionSelectQuery = this.globalService.preparePrismaSql(
      `SELECT * from (${doctorQuery} UNION ALL ${fieldQuery} UNION ALL ${coachQuery}) AS result ORDER BY createdAt LIMIT ${filters.limit} OFFSET ${filters.offset};`,
    );
    const unionCountQuery = this.globalService.preparePrismaSql(
      `SELECT SUM(count) AS count from (${doctorCountRawSql} UNION ALL ${fieldCountRawSql} UNION ALL ${coachCountRawSql}) AS countResult;`,
    );
    const [searchResults, countResult] = await Promise.all([
      this.prisma.$queryRaw(unionSelectQuery),
      this.prisma.$queryRaw(unionCountQuery),
    ]);
    const { count } =
      Array.isArray(countResult) && countResult.length ? countResult[0] : { count: 0 };
    return {
      searchResults: (searchResults as SearchResultDto[]).map((result) => {
        let sports = result.sports && this.globalService.safeParse(result.sports);
        if (Array.isArray(sports) && sports.length) {
          sports = [...new Set(sports)];
        }
        return {
          ...result,
          sports,
        };
      }),
      count: parseInt(count || 0) as number,
    };
  }
}
