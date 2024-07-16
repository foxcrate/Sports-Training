import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { GlobalService } from 'src/global/global.service';
import {
  ACCEPTANCE_STATUSES_ENUM,
  RATEABLE_TYPES_ENUM,
  SESSIONS_STATUSES_ENUM,
} from 'src/global/enums';
import { SearchResultDto, SearchResultsDto } from './dto/search-result.dto';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class HomeModel {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
    private readonly i18n: I18nService,
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
  async getSports(userId: number) {
    let allSports: ReturnSportDto[] = await this.prisma.$queryRaw`
    SELECT
    Sport.id,
    Sport.name AS name
    FROM Sport
    `;
    console.log('allSports:', allSports);

    return allSports;
  }

  async getPackages(userId: number) {
    // get children
    // get children sports
    // get coaches who work in this sports
    // get the packages of theses coaches

    let allPackages: any = await this.prisma.$queryRaw`
    WITH children AS (
      SELECT
      childId
      FROM
      ParentsChilds
      WHERE
      parentId = ${userId}
    ),
    childrenProfiles AS (
      SELECT
      PlayerProfile.id AS id
      FROM
      PlayerProfile
      WHERE userId in (SELECT childId FROM children)
    ),
    childrenSports AS (
      SELECT
      sportId
      FROM
      PlayerProfileSports
      WHERE playerProfileId in (SELECT id FROM childrenProfiles)
    ),
    sportsTrainers AS (
      SELECT
      trainerProfileId
      FROM
      TrainerProfileSports
      WHERE
      sportId in (SELECT sportId FROM childrenSports)
    ),
    trainerPackages AS (
      SELECT
      Package.id AS id
      FROM
      Package
      WHERE
      Package.trainerProfileId in (SELECT trainerProfileId FROM sportsTrainers)
    )
    SELECT
    CASE
        WHEN COUNT(Package.id ) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id',Package.id,
            'name', Package.name,
            'description', Package.description,
            'type', Package.type,
            'price', Package.price,
            'numberOfSessions', Package.numberOfSessions,
            'ExpirationDate', Package.ExpirationDate,
            'maxAttendees', Package.maxAttendees,
            'minAttendees', Package.minAttendees,
            'location', Region.name,
            'trainerProfileId', Package.trainerProfileId,
            'coachFirstName', User.firstName,
            'coachLastName', User.lastName,
            'coachProfileImage', User.profileImage
            )
        )
        END AS packages
    FROM
    Package
    LEFT JOIN TrainerProfile ON Package.trainerProfileId = TrainerProfile.id
    LEFT JOIN User ON TrainerProfile.userId = User.id
    LEFT JOIN Field ON Package.fieldId = Field.id
    LEFT JOIN Region ON Field.regionId = Region.id
    WHERE Package.id in (SELECT id FROM trainerPackages)
    `;

    console.log('allPackages:', allPackages);

    if (allPackages[0].packages == null) {
      return [];
    }
    return allPackages[0].packages;
  }

  async getChildrenNames(userId: number) {
    let childrenNames: [] = await this.prisma.$queryRaw`
    WITH children AS (
      SELECT
      childId
      FROM
      ParentsChilds
      WHERE
      parentId = ${userId}
    )
    SELECT
    firstName
    FROM
    User
    WHERE
    id in (SELECT childId FROM children)
    `;
    console.log('childrenNames:', childrenNames);

    if (childrenNames.length == 0) {
      return [];
    }
    return childrenNames.map((child: any) => child.firstName);
  }

  async getPlayerSessions(userId: number) {
    let playerSessions: any = await this.prisma.$queryRaw`
      SELECT
      CASE
        WHEN COUNT(TrainerBookedSession.id) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id',TrainerBookedSession.id,
            'date', TrainerBookedSession.date,
            'coachFirstName',User.firstName,
            'coachLastName',User.lastName,
            'coachProfileImage',User.profileImage,
            'fieldId',Field.id,
            'fieldName',Field.name,
            'location',Region.name,
            'startTime',Slot.FromTime,
            'endTime',Slot.ToTime
          )
        )
      END AS sessions
      FROM
      TrainerBookedSession
      LEFT JOIN TrainerProfile ON TrainerBookedSession.trainerProfileId = TrainerProfile.id
      LEFT JOIN User ON TrainerProfile.userId = User.id
      LEFT JOIN TrainerProfileSports ON TrainerProfileSports.trainerProfileId = TrainerProfile.id
      LEFT JOIN Sport ON TrainerProfileSports.sportId = Sport.id
      LEFT JOIN Slot ON TrainerBookedSession.slotId = Slot.id
      LEFT JOIN Field ON Slot.fieldId = Field.id
      LEFT JOIN Region ON Field.regionId = Region.id
      WHERE
      TrainerBookedSession.userId = ${userId}
      AND
      TrainerBookedSession.status = ${SESSIONS_STATUSES_ENUM.ACTIVE}
      AND
      TrainerBookedSession.date >= CURDATE() AND TrainerBookedSession.date < DATE_ADD(CURDATE(), INTERVAL 2 DAY)
    `;

    console.log('playerSessions:', playerSessions);

    if (playerSessions[0].sessions == null) {
      return [];
    }

    return playerSessions[0].sessions;
  }

  async getTrainerSessions(userId: number) {
    let trainerSessions: any = await this.prisma.$queryRaw`
      SELECT
      CASE
        WHEN COUNT(TrainerBookedSession.id) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id',TrainerBookedSession.id,
            'date', TrainerBookedSession.date,
            'playerFirstName',User.firstName,
            'playerLastName',User.lastName,
            'playerProfileImage',User.profileImage,
            'fieldId',Field.id,
            'fieldName',Field.name,
            'location',Region.name,
            'startTime',Slot.FromTime,
            'endTime',Slot.ToTime
          )
        )
      END AS sessions
      FROM
      TrainerBookedSession
      LEFT JOIN TrainerProfile ON TrainerBookedSession.trainerProfileId = TrainerProfile.id
      LEFT JOIN User ON TrainerBookedSession.userId = User.id
      LEFT JOIN TrainerProfileSports ON TrainerProfileSports.trainerProfileId = TrainerProfile.id
      LEFT JOIN Sport ON TrainerProfileSports.sportId = Sport.id
      LEFT JOIN Slot ON TrainerBookedSession.slotId = Slot.id
      LEFT JOIN Field ON Slot.fieldId = Field.id
      LEFT JOIN Region ON Field.regionId = Region.id
      WHERE
      TrainerBookedSession.trainerProfileId = (SELECT id FROM TrainerProfile WHERE userId = ${userId})
      AND
      TrainerBookedSession.status = ${SESSIONS_STATUSES_ENUM.ACTIVE}
      AND
      TrainerBookedSession.date >= CURDATE() AND TrainerBookedSession.date < DATE_ADD(CURDATE(), INTERVAL 2 DAY)
    `;

    console.log('trainerSessions:', trainerSessions);

    if (trainerSessions[0].sessions == null) {
      return [];
    }

    return trainerSessions[0].sessions;
  }

  async getTrainerPendingSessions(userId: number) {
    let trainerSessions: any = await this.prisma.$queryRaw`
      SELECT
      CASE
        WHEN COUNT(TrainerBookedSession.id) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id',TrainerBookedSession.id,
            'date', TrainerBookedSession.date,
            'playerFirstName',User.firstName,
            'playerLastName',User.lastName,
            'playerProfileImage',User.profileImage,
            'fieldId',Field.id,
            'fieldName',Field.name,
            'location',Region.name,
            'startTime',Slot.FromTime,
            'endTime',Slot.ToTime
          )
        )
      END AS sessions
      FROM
      TrainerBookedSession
      LEFT JOIN TrainerProfile ON TrainerBookedSession.trainerProfileId = TrainerProfile.id
      LEFT JOIN User ON TrainerBookedSession.userId = User.id
      LEFT JOIN TrainerProfileSports ON TrainerProfileSports.trainerProfileId = TrainerProfile.id
      LEFT JOIN Sport ON TrainerProfileSports.sportId = Sport.id
      LEFT JOIN Slot ON TrainerBookedSession.slotId = Slot.id
      LEFT JOIN Field ON Slot.fieldId = Field.id
      LEFT JOIN Region ON Field.regionId = Region.id
      WHERE
      TrainerBookedSession.trainerProfileId = (SELECT id FROM TrainerProfile WHERE userId = ${userId})
      AND
      TrainerBookedSession.status = ${SESSIONS_STATUSES_ENUM.NOT_ACTIVE}
      AND
      TrainerBookedSession.date >= CURDATE() AND TrainerBookedSession.date < DATE_ADD(CURDATE(), INTERVAL 2 DAY)
    `;

    console.log('trainerSessions:', trainerSessions);

    if (trainerSessions[0].sessions == null) {
      return [];
    }

    return trainerSessions[0].sessions;
  }

  async getSportsFields(userId: number) {
    let sportsFields: [] = await this.prisma.$queryRaw`
      WITH TrainerSports AS (
        SELECT
        sportId
        FROM
        TrainerProfileSports
        WHERE
        trainerProfileId = (SELECT id FROM TrainerProfile WHERE userId = ${userId})
      )
      SELECT
      Field.id AS id,
      Field.name AS name,
      Field.profileImage AS profileImage,
      Region.name AS region,
      Sport.name AS sport
      FROM
      Field
      LEFT JOIN Sport ON Field.sportId = Sport.id
      LEFT JOIN Region ON Field.regionId = Region.id
      WHERE
      Field.sportId in (SELECT sportId FROM TrainerSports)
    `;

    console.log('sportsFields:', sportsFields);

    return sportsFields;
  }

  async getLastSessionsTrainees(userId: number) {
    let lastSessionsTrainees: any = await this.prisma.$queryRaw`
      SELECT
      CASE
        WHEN COUNT(TrainerBookedSession.id) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id',User.id,
            'firstName',User.firstName,
            'lastName',User.lastName,
            'profileImage',User.profileImage,
            'date', TrainerBookedSession.date
          )
        )
      END AS trainees
      FROM
      TrainerBookedSession
      LEFT JOIN User ON TrainerBookedSession.userId = User.id
      WHERE
      TrainerBookedSession.trainerProfileId = (SELECT id FROM TrainerProfile WHERE userId = ${userId})
      AND
      TrainerBookedSession.status = ${SESSIONS_STATUSES_ENUM.ACTIVE}
      AND
      TrainerBookedSession.date <= CURDATE() AND TrainerBookedSession.date > DATE_ADD(CURDATE(), INTERVAL -7 DAY)
      `;

    console.log('lastSessionsTrainees:', lastSessionsTrainees);

    if (lastSessionsTrainees[0].trainees == null) {
      return [];
    }

    return lastSessionsTrainees[0].trainees;
  }

  async getPlayerFeedbacks(userId: number) {
    let playerFeedbacks: any = await this.prisma.$queryRaw`
      SELECT
      CASE
        WHEN COUNT(Rate.id) = 0 THEN null
        ELSE
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id',Rate.id,
            'feedback',Rate.feedback,
            'rate',Rate.ratingNumber,
            'coachFirstName',User.firstName,
            'coachLastName',User.lastName,
            'date', Rate.createdAt
          )
        )
      END AS feedbacks
      FROM
      Rate
      LEFT JOIN TrainerProfile ON TrainerProfile.id = (SELECT id FROM TrainerProfile WHERE userId = Rate.userId)
      LEFT JOIN User ON User.id = TrainerProfile.userId
      WHERE
      Rate.playerProfileId = (SELECT id FROM PlayerProfile WHERE userId = ${userId})
      AND
      Rate.rateableType = ${RATEABLE_TYPES_ENUM.PLAYER}
      `;

    console.log(playerFeedbacks);

    if (playerFeedbacks[0].feedbacks == null) {
      return [];
    }

    return playerFeedbacks[0].feedbacks;
  }
}

// ,
//     trainerPackages AS (
//       SELECT
//       id
//       Package
//       WHERE
//       trainerProfileId in (SELECT trainerProfileId FROM sportsTrainers)
//     )
// ,
// (SELECT * FROM trainerPackages) AS trainerPackages
