import { Injectable } from '@nestjs/common';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReturnPlayerProfileDto } from './dtos/return.dto';
import { SportService } from 'src/sport/sport.service';
import { PlayerProfileCreateDto } from './dtos/create.dto';

@Injectable()
export class PlayerProfileModel {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
    private sportService: SportService,
  ) {}

  async getOneDetailedByUserId(userId): Promise<ReturnPlayerProfileDto> {
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
    return playerProfileWithSports[0];
  }

  async create(createData: PlayerProfileCreateDto, userId) {
    await this.prisma.$queryRaw`
    INSERT INTO PlayerProfile
      (level,
      regionId,
      userId,
      updatedAt)
      VALUES
    (${createData.level},
    ${createData.regionId},
    ${userId},
    ${this.globalService.getLocalDateTime(new Date())})`;

    let newPlayerProfile = await this.getOneByUserId(userId);

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, newPlayerProfile.id);
    }
  }

  async updateById(createData: PlayerProfileCreateDto, playerProfileId) {
    await this.prisma.$queryRaw`
        UPDATE PlayerProfile
        SET
        level = ${createData.level},
        regionId = ${createData.regionId},
        updatedAt = ${this.globalService.getLocalDateTime(new Date())}
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

  async getOneByUserId(userId): Promise<ReturnPlayerProfileDto> {
    let playerProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM PlayerProfile
      WHERE userId = ${userId}
      LIMIT 1
    `;
    return playerProfile[0];
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
        // updatedAt: this.globalService.getLocalDateTime(new Date()),
        updatedAt: new Date(),
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
}
