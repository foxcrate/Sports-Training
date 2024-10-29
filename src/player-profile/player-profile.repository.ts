import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ReturnPlayerProfileDto } from './dtos/return.dto';
import { SportService } from 'src/sport/sport.service';
import { PlayerProfileCreateDto } from './dtos/create.dto';
import { ReturnPlayerProfileWithUserAndSportsDto } from './dtos/return-with-user-and-sports.dto';
import { RegionService } from 'src/region/region.service';
import { PACKAGE_STATUS } from 'src/global/enums';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { FIND_BY } from './player-profile-enums';
import { PlayerProfileDetailedOptions } from './dtos/player-profile-detailed-options.dto';

@Injectable()
export class PlayerProfileRepository {
  constructor(
    private prisma: PrismaService,
    private sportService: SportService,
    private regionService: RegionService,
    private readonly i18n: I18nService,
  ) {}

  async getOneBy(column: FIND_BY, value: any): Promise<ReturnPlayerProfileDto> {
    let query = `
      SELECT
      id,
      levelId,
      regionId,
      userId,
      createdAt
      FROM PlayerProfile
      WHERE ${column} = ?
      LIMIT 1
    `;

    let playerProfile = await this.prisma.$queryRawUnsafe(query, value);

    if (!playerProfile[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.PLAYER_PROFILE_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    return playerProfile[0];
  }

  async getOneChildDetailedById(
    userId: number,
  ): Promise<ReturnPlayerProfileWithUserAndSportsDto> {
    let playerProfileWithSports = await this.prisma.$queryRaw`
    SELECT
    pp.id AS id,
    MAX(LevelTranslation.name) AS level,
    pp.regionId AS regionId,
    pp.userId AS userId,
    u.id AS userId,
    u.firstName AS firstName,
    u.lastName AS lastName,
    CASE 
    WHEN COUNT(s.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(
      JSON_OBJECT(
      'id',s.id,
      'name', SportTranslation.name
      )
      )
    END AS sports
    FROM PlayerProfile AS pp
    LEFT JOIN Level ON pp.levelId = Level.id
    LEFT JOIN LevelTranslation ON LevelTranslation.levelId = Level.id
      AND LevelTranslation.language = ${I18nContext.current().lang}
    LEFT JOIN User AS u ON pp.userId = u.id
    LEFT JOIN PlayerProfileSports AS pps ON pp.id = pps.playerProfileId
    LEFT JOIN Sport AS s ON pps.sportId = s.id
    LEFT JOIN SportTranslation AS SportTranslation ON SportTranslation.sportId = s.id
        AND SportTranslation.language = ${I18nContext.current().lang}
    WHERE pp.id = ${userId}
    GROUP BY pp.id
    ;`;

    return playerProfileWithSports[0];
  }

  async checkExistence(userId): Promise<ReturnPlayerProfileDto> {
    // console.log('userId', userId);

    let playerProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM PlayerProfile
      WHERE userId = ${userId}
      LIMIT 1
    `;

    if (!playerProfile[0]) {
      return null;
    }

    return playerProfile[0];
  }

  async getOneDetailedBy(
    column: FIND_BY,
    value: any,
    selectedColumns: PlayerProfileDetailedOptions,
  ): Promise<ReturnPlayerProfileDto> {
    if (selectedColumns == null) {
      selectedColumns = {};
    }

    const query = this.buildGetDetailedQuery(column, selectedColumns);

    // console.log(query);

    let playerProfile: any[];

    if (selectedColumns.packages) {
      playerProfile = await this.prisma.$queryRawUnsafe(
        query,
        selectedColumns.packages ? PACKAGE_STATUS.ACTIVE : '',
        selectedColumns.packages ? PACKAGE_STATUS.PENDING : '',
        value,
      );
    } else {
      playerProfile = await this.prisma.$queryRawUnsafe(query, value);
    }

    return playerProfile[0];
  }

  async getManyChildrenByUserIds(
    usersIds: number[],
  ): Promise<ReturnPlayerProfileWithUserAndSportsDto[]> {
    let childProfileWithSports: ReturnPlayerProfileWithUserAndSportsDto[] = await this
      .prisma.$queryRaw`
    SELECT
    pp.id AS id,
    MAX(LevelTranslation.name) AS level,
    pp.regionId AS regionId,
    pp.userId AS userId,
    u.id AS userId,
    u.firstName AS firstName,
    u.lastName AS lastName,
    CASE 
    WHEN COUNT(s.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(JSON_OBJECT(
        'id',s.id,
        'name', SportTranslation.name)) 
    END AS sports
    FROM PlayerProfile AS pp
    LEFT JOIN Level ON pp.levelId = Level.id
      LEFT JOIN LevelTranslation ON LevelTranslation.levelId = Level.id
      AND LevelTranslation.language = ${I18nContext.current().lang}
    LEFT JOIN User AS u ON pp.userId = u.id
    LEFT JOIN PlayerProfileSports AS pps ON pp.id = pps.playerProfileId
    LEFT JOIN Sport AS s ON pps.sportId = s.id
    LEFT JOIN SportTranslation AS SportTranslation ON SportTranslation.sportId = s.id
        AND SportTranslation.language = ${I18nContext.current().lang}
    WHERE pp.userId IN (${Prisma.join(usersIds)})
    GROUP BY pp.id
    ;`;
    return childProfileWithSports;
  }

  async create(createData: PlayerProfileCreateDto, userId) {
    await this.prisma.$queryRaw`
    INSERT INTO PlayerProfile
      (levelId,
      regionId,
      userId)
      VALUES
    (${createData.levelId},
    ${createData.regionId},
    ${userId})`;

    let newPlayerProfile = await this.getOneBy(FIND_BY.USER_ID, userId);

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, newPlayerProfile.id);
    }

    await this.getOneDetailedBy(FIND_BY.USER_ID, newPlayerProfile.userId, {
      level: true,
      sports: true,
      user: true,
      region: true,
      packages: true,
    });
  }

  async createIfNotExist(userId): Promise<ReturnPlayerProfileDto> {
    // check existence
    let foundedPlayerProfile = await this.checkExistence(userId);

    if (foundedPlayerProfile) {
      return foundedPlayerProfile;
    }
    await this.prisma.$queryRaw`
      INSERT INTO PlayerProfile
      (userId)
      VALUES
      (${userId})
    `;

    return await this.getOneBy(FIND_BY.USER_ID, userId);
  }

  async setById(
    setData: Partial<PlayerProfileCreateDto>,
    playerProfileId: number,
  ): Promise<void> {
    if (setData.sports && setData.sports.length > 0) {
      await this.createProfileSports(setData.sports, playerProfileId);
    } else if (setData.sports && setData.sports.length == 0) {
      await this.deletePlayerSports(playerProfileId);
    }
    delete setData.sports;

    const { setClause, values } = this.buildUpdateQuery(setData);

    if (setClause) {
      const query = `
        UPDATE PlayerProfile
        SET ${setClause}
        WHERE id = ?;
    `;

      await this.prisma.$queryRawUnsafe(query, ...values, playerProfileId);
    }
  }

  async deletePlayerSports(playerProfileId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM PlayerProfileSports
      WHERE playerProfileId = ${playerProfileId}
    `;
  }

  async createProfileSports(sportsIds, newPlayerProfileId) {
    //throw an error if a sport id is not exist
    await this.sportService.checkExistance(sportsIds);

    //array of objects to insert to db
    const profilesAndSports = [];
    for (let i = 0; i < sportsIds.length; i++) {
      profilesAndSports.push({
        playerProfileId: newPlayerProfileId,
        sportId: sportsIds[i],
      });
    }

    //delete past PlayerProfileSports
    await this.deletePlayerSports(newPlayerProfileId);

    await this.prisma.playerProfileSports.createMany({ data: profilesAndSports });
  }

  async deleteBy(column: FIND_BY, value: any) {
    let query = `
      DELETE
      FROM
      PlayerProfile
      WHERE ${column} = ?
    `;

    await this.prisma.$queryRawUnsafe(query, value);
  }

  private buildUpdateQuery(data: Partial<PlayerProfileCreateDto>): {
    setClause: string;
    values: any[];
  } {
    const setParts: string[] = [];
    const values: any[] = [];

    if (data.levelId !== undefined) {
      setParts.push('levelId = ?');
      values.push(data.levelId);
    }
    if (data.regionId !== undefined) {
      setParts.push('regionId = ?');
      values.push(data.regionId);
    }

    return { setClause: setParts.join(', '), values };
  }

  private buildGetDetailedQuery(
    column: string,
    selectedColumns: PlayerProfileDetailedOptions,
  ): string {
    const selectColumns: string[] = ['pp.id AS id'];

    if (selectedColumns.level) {
      selectColumns.push('MAX(LevelTranslation.name) AS level');
    }
    if (selectedColumns.region) {
      selectColumns.push(`
        CASE WHEN COUNT(r.id) = 0 THEN null ELSE JSON_OBJECT(
          'id', r.id, 
          'name', MAX(RegionTranslation.name)
        ) END AS region
      `);
    }
    if (selectedColumns.sports) {
      selectColumns.push(`
        CASE WHEN COUNT(s.id) = 0 THEN null ELSE JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', s.id, 
            'name', SportTranslation.name
          )
        ) END AS sports
      `);
    }
    if (selectedColumns.packages) {
      selectColumns.push(`
        CASE WHEN COUNT(Package.id) = 0 THEN null ELSE JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', Package.id,
            'name', Package.name,
            'description', Package.description,
            'type', Package.type,
            'price', Package.price,
            'status', Package.status,
            'numberOfSessions', Package.numberOfSessions,
            'ExpirationDate', Package.ExpirationDate,
            'currentAttendeesNumber', Package.currentAttendeesNumber,
            'maxAttendees', Package.maxAttendees,
            'minAttendees', Package.minAttendees,
            'location', coachRegion.name,
            'sessionsTaken', PlayerProfilePackages.sessionsTaken,
            'trainerProfileId', Package.trainerProfileId,
            'coachFirstName', coachUser.firstName,
            'coachLastName', coachUser.lastName,
            'profileImage', coachUser.profileImage
          )
        ) END AS packages
      `);
    }
    if (selectedColumns.user) {
      selectColumns.push(`
        JSON_OBJECT(
          'id', u.id,
          'firstName', u.firstName,
          'lastName', u.lastName,
          'email', u.email,
          'profileImage', u.profileImage,
          'mobileNumber', u.mobileNumber,
          'gender', MAX(GenderTranslation.name),
          'birthday', u.birthday
        ) AS user
      `);
    }

    const joins: string[] = [];

    if (selectedColumns.level) {
      joins.push(`
        LEFT JOIN Level ON pp.levelId = Level.id
        LEFT JOIN LevelTranslation 
          ON LevelTranslation.levelId = Level.id 
          AND LevelTranslation.language = '${I18nContext.current().lang}'
      `);
    }

    if (selectedColumns.region) {
      joins.push(`
        LEFT JOIN Region AS r ON pp.regionId = r.id
        LEFT JOIN RegionTranslation 
          ON RegionTranslation.regionId = r.id 
          AND RegionTranslation.language = '${I18nContext.current().lang}'
      `);
    }

    if (selectedColumns.sports) {
      joins.push(`
        LEFT JOIN PlayerProfileSports AS pps ON pp.id = pps.playerProfileId
        LEFT JOIN Sport AS s ON pps.sportId = s.id
        LEFT JOIN SportTranslation 
          ON SportTranslation.sportId = s.id 
          AND SportTranslation.language = '${I18nContext.current().lang}'
      `);
    }

    if (selectedColumns.packages) {
      joins.push(`
        LEFT JOIN PlayerProfilePackages ON pp.id = PlayerProfilePackages.playerProfileId
        LEFT JOIN Package ON PlayerProfilePackages.packageId = Package.id 
          AND Package.status IN (?, ?)
        LEFT JOIN TrainerProfile ON Package.trainerProfileId = TrainerProfile.id
        LEFT JOIN User AS coachUser ON TrainerProfile.userId = coachUser.id
        LEFT JOIN Field AS coachField ON Package.fieldId = coachField.id
        LEFT JOIN Region AS coachRegion ON coachField.regionId = coachRegion.id
      `);
    }

    if (selectedColumns.user) {
      joins.push(`
        LEFT JOIN User AS u ON pp.userId = u.id
        LEFT JOIN Gender ON u.genderId = Gender.id
        LEFT JOIN GenderTranslation 
          ON GenderTranslation.genderId = Gender.id 
          AND GenderTranslation.language = '${I18nContext.current().lang}'
      `);
    }

    return `
      SELECT ${selectColumns.join(', ')}
      FROM PlayerProfile AS pp
      ${joins.join(' ')}
      WHERE pp.${column} = ?
      GROUP BY pp.id;
    `;
  }
}
