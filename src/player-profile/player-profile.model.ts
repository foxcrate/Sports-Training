import { Injectable } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ReturnPlayerProfileDto } from './dtos/return.dto';
import { SportService } from 'src/sport/sport.service';
import { PlayerProfileCreateDto } from './dtos/create.dto';
import { ReturnPlayerProfileWithUserAndSportsDto } from './dtos/return-with-user-and-sports.dto';

@Injectable()
export class PlayerProfileModel {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
    private sportService: SportService,
  ) {}

  async getOneById(playerProfileId): Promise<ReturnPlayerProfileDto> {
    let playerProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM PlayerProfile
      WHERE id = ${playerProfileId}
      LIMIT 1
    `;
    return playerProfile[0];
  }

  async getOneDetailedById(
    userId: number,
  ): Promise<ReturnPlayerProfileWithUserAndSportsDto> {
    let playerProfileWithSports = await this.prisma.$queryRaw`
    SELECT
    pp.id AS id,
    pp.level AS level,
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
      'name', s.name))
    END AS sports
    FROM PlayerProfile AS pp
    LEFT JOIN User AS u ON pp.userId = u.id
    LEFT JOIN PlayerProfileSports AS pps ON pp.id = pps.playerProfileId
    LEFT JOIN Sport AS s ON pps.sportId = s.id
    WHERE pp.id = ${userId}
    GROUP BY pp.id
    ;`;

    return playerProfileWithSports[0];
  }

  async getOneByUserId(userId): Promise<ReturnPlayerProfileDto> {
    let playerProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM PlayerProfile
      WHERE userId = ${userId}
      LIMIT 1
    `;
    return playerProfile[0];
  }

  async getOneDetailedByUserId(userId): Promise<ReturnPlayerProfileDto> {
    //NOTE: the use of COUNT aggregate function in  "WHEN COUNT(s.id ) = 0 THEN null" is not necessary please just change it to "WHEN s.id IS NULL THEN NULL"
    //this idea you used alot and it is not necessary. please find each occurrence of it and change it as it just calls the aggregate function without any need to do so and this can impact performance.
    //aggregate function usually do a full table lookup so we need to be careful and make sure it is only used when needed and that our joining conditions are using indexes whenever possible.
    let playerProfileWithSports = await this.prisma.$queryRaw`
    WITH UserDetails AS (
      SELECT id,firstName,lastName,email,profileImage,mobileNumber,gender,birthday
      FROM User
      WHERE id = ${userId}
    ),
    playerProfileWithSports AS (
      SELECT
      pp.id AS id,
      pp.level AS level,
      CASE 
      WHEN count(r.id) = 0 THEN null
      ELSE
      JSON_OBJECT(
        'id',r.id,
        'name', r.name)
      END AS region,
      pp.userId AS userId,
      CASE 
      WHEN COUNT(s.id ) = 0 THEN null
      ELSE
      JSON_ARRAYAGG(JSON_OBJECT(
        'id',s.id,
        'name', s.name)) 
      END AS sports
      FROM PlayerProfile AS pp
      LEFT JOIN Region AS r ON pp.regionId = r.id
      LEFT JOIN PlayerProfileSports AS pps ON pp.id = pps.playerProfileId
      LEFT JOIN Sport AS s ON pps.sportId = s.id
      WHERE pp.userId = ${userId}
      GROUP BY pp.id
      LIMIT 1
    )
    SELECT
      pps.id,
      pps.level,
      pps.region AS region,
      pps.sports AS sports,
      JSON_ARRAYAGG(JSON_OBJECT(
      'id',ud.id,
      'firstName',ud.firstName,
      'lastName', ud.lastName,
      'email',ud.email,
      'profileImage', ud.profileImage,
      'mobileNudmber',ud.mobileNumber,
      'gender', ud.gender,
      'birthday',ud.birthday
      )
    ) AS user
     FROM playerProfileWithSports AS pps
    LEFT JOIN UserDetails AS ud
    ON pps.userId = ud.id
    GROUP BY pps.id
    `;
    //NOTE: i think you should use inner join. you need this null if use details doesn't exists
    return playerProfileWithSports[0];
  }

  async getManyByUserIds(
    usersIds: number[],
  ): Promise<ReturnPlayerProfileWithUserAndSportsDto[]> {
    let childProfileWithSports: ReturnPlayerProfileWithUserAndSportsDto[] = await this
      .prisma.$queryRaw`
    SELECT
    pp.id AS id,
    pp.level AS level,
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
        'name', s.name)) 
    END AS sports
    FROM PlayerProfile AS pp
    LEFT JOIN User AS u ON pp.userId = u.id
    LEFT JOIN PlayerProfileSports AS pps ON pp.id = pps.playerProfileId
    LEFT JOIN Sport AS s ON pps.sportId = s.id
    WHERE pp.userId IN (${Prisma.join(usersIds)})
    GROUP BY pp.id
    ;`;
    return childProfileWithSports;
  }

  async create(createData: PlayerProfileCreateDto, userId) {
    await this.prisma.$queryRaw`
    INSERT INTO PlayerProfile
      (level,
      regionId,
      userId)
      VALUES
    (${createData.level},
    ${createData.regionId},
    ${userId})`;

    let newPlayerProfile = await this.getOneByUserId(userId);

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, newPlayerProfile.id);
    }

    // await this.getOneDetailedByUserId(newPlayerProfile.userId);
  }

  async updateById(createData: PlayerProfileCreateDto, playerProfileId: number) {
    await this.prisma.$queryRaw`
        UPDATE PlayerProfile
        SET
        level = ${createData.level},
        regionId = ${createData.regionId}
        WHERE
        id = ${playerProfileId};
      `;

    //if sportsIds array is provided, insert them in PlayerProfileSports
    //else do nothing

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, playerProfileId);
    } else if (createData.sports && createData.sports.length == 0) {
      await this.deletePlayerSports(playerProfileId);
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
    await this.sportService.checkSportsExistance(sportsIds);

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

  async deleteByUserId(userId: number) {
    await this.prisma.$queryRaw`
    DELETE FROM
    PlayerProfile
    WHERE
    userId = ${userId};
  `;
  }

  async deleteById(playerProfileId: number) {
    //delete childProfileSports
    await this.deletePlayerSports(playerProfileId);

    //delete
    await this.prisma.$queryRaw`
      DELETE FROM
      PlayerProfile
      WHERE
      id = ${playerProfileId};
  `;
  }
}
