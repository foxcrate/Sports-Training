// import { async } from 'rxjs';
import { ReturnPlayerProfileDto } from '../dtos/return.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';

export class ReturnPlayerProfileSerializer {
  public prisma: any;
  constructor() {
    this.prisma = new PrismaService();
  }
  async serialize(
    playerProfiles: any | any[],
  ): Promise<ReturnPlayerProfileDto | ReturnPlayerProfileDto[]> {
    if (Array.isArray(playerProfiles)) {
      let playerProfileIds = playerProfiles.map((x) => {
        return x.id;
      });

      // console.log({ playerProfiles });
      // console.log({ playerProfileIds });

      //object with userId next to user sports
      let usersSports = await this.getPlayersSports(playerProfileIds);

      // console.log({ usersSports });

      let playerProfilesMapped = playerProfiles.map((playerProfile) => {
        return {
          id: playerProfile.id,
          level: playerProfile.level,
          userId: playerProfile.userId,
          regionId: playerProfile.regionId,
          sports: usersSports[playerProfile.userId] ?? [],
        };
      });

      return playerProfilesMapped;
    } else {
      let playerProfile = playerProfiles;

      playerProfile = {
        id: playerProfile.id,
        level: playerProfile.level,
        userId: playerProfile.userId,
        regionId: playerProfile.regionId,
        sports: await this.getPlayerSports(playerProfile.id),
      };
      return playerProfile;
    }
  }
  async getPlayerSports(playerProfileId: number): Promise<ReturnSportDto[]> {
    let sports: any = await this.prisma.$queryRaw`
    SELECT
      s.id As id,
      s.enName AS enName,
      s.arName AS arName
    FROM
      Sport s
    JOIN
    PlayerProfileSports pps
    ON
    s.id = pps.sportId
    WHERE
    pps.playerProfileId = ${playerProfileId}
    `;

    return sports;
  }

  async getPlayersSports(playerProfileIds: number[]): Promise<[]> {
    //return empty array if playerProfileIds is empty
    if (playerProfileIds.length == 0) {
      return [];
    }
    let sports: any = await this.prisma.$queryRaw`
    SELECT DISTINCT
      s.id As id,
      s.enName AS enName,
      s.arName AS arName,
      pp.userId AS userId
    FROM
      Sport s
    JOIN
    PlayerProfileSports pps
    ON
    s.id = pps.sportId
    JOIN
    PlayerProfile pp
    ON
    pp.id = pps.playerProfileId
    WHERE
    pps.playerProfileId IN (${Prisma.join(playerProfileIds)})
    `;

    //Group the records by user id
    const groupedData = sports.reduce((acc, obj) => {
      const key = obj.userId;
      acc[key] = acc[key] ?? [];
      const { userId, ...newObj } = obj;
      acc[key].push(newObj);
      return acc;
    }, {});

    return groupedData;
  }
}
