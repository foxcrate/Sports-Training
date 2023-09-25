// import { async } from 'rxjs';
import { ReturnChildProfileDto } from '../dtos/return.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export class ReturnChildProfileSerializer {
  public prisma: any;
  constructor() {
    this.prisma = new PrismaService();
  }
  async serialize(
    childProfiles: any | any[],
  ): Promise<ReturnChildProfileDto | ReturnChildProfileDto[]> {
    if (Array.isArray(childProfiles)) {
      let childProfileIds = childProfiles.map((x) => {
        return x.id;
      });

      //object with userId next to user sports
      let childSports = await this.getChildsSports(childProfileIds);

      let childProfilesMapped = childProfiles.map((childProfile) => {
        return {
          id: childProfile.id,
          level: childProfile.level,
          childId: childProfile.childId,
          regionId: childProfile.regionId,
          sports: childSports[childProfile.childId] ?? [],
        };
      });

      return childProfilesMapped;
    } else {
      let childProfile = childProfiles;

      childProfile = {
        id: childProfile.id,
        level: childProfile.level,
        childId: childProfile.childId,
        regionId: childProfile.regionId,
        sports: await this.getChildSports(childProfile.id),
      };
      return childProfile;
    }
  }
  async getChildSports(childProfileId: number): Promise<any[]> {
    let sports: any = await this.prisma.$queryRaw`
    SELECT
      s.id As id,
      s.enName AS enName,
      s.arName AS arName
    FROM
      Sport s
    JOIN
    ChildProfileSports cps
    ON
    s.id = cps.sportId
    WHERE
    cps.childProfileId = ${childProfileId}
    `;

    return sports;
  }

  async getChildsSports(childsProfileIds: number[]): Promise<any[]> {
    //return empty array if childProfileIds is empty
    if (childsProfileIds.length == 0) {
      return [];
    }
    let sports: any = await this.prisma.$queryRaw`
    SELECT DISTINCT
      s.id As id,
      s.enName AS enName,
      s.arName AS arName,
      cp.childId AS childId
    FROM
      Sport s
    JOIN
    ChildProfileSports cps
    ON
    s.id = cps.sportId
    JOIN
    ChildProfile cp
    ON
    cp.id = cps.childProfileId
    WHERE
    cps.childProfileId IN (${Prisma.join(childsProfileIds)})
    `;

    //Group the records by user id
    const groupedData = sports.reduce((acc, obj) => {
      const key = obj.childId;
      acc[key] = acc[key] ?? [];
      const { childId, ...newObj } = obj;
      acc[key].push(newObj);
      return acc;
    }, {});

    // console.log({ groupedData });

    return groupedData;
  }
}
