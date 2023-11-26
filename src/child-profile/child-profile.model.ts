import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ReturnChildProfileWithChildAndSportsDto } from './dtos/return-with-child-and-sports.dto';
import { ReturnChildProfileDto } from './dtos/return.dto';
import { ChildProfileCreateDto } from './dtos/create.dto';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';
import { SportService } from 'src/sport/sport.service';

@Injectable()
export class ChildProfileModel {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
    private globalService: GlobalService,
    private sportService: SportService,
  ) {}

  async create(
    createData: ChildProfileCreateDto,
    childId,
  ): Promise<ReturnChildProfileWithChildAndSportsDto> {
    //insert
    await this.prisma.$queryRaw`
        INSERT INTO ChildProfile
          (level,
          regionId,
          childId,
          updatedAt)
          VALUES
        (${createData.level},
        ${createData.regionId},
        ${childId},
        ${this.globalService.getLocalDateTime(new Date())})`;

    let newChildProfile: ReturnChildProfileDto = await this.getOneByChildId(childId);

    //if sportsIds array is provided, insert them in PlayerProfileSports
    //else do nothing

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, newChildProfile.id);
    }

    let newChildProfileWithSports = this.getOneDetailedByChildId(childId);
    return newChildProfileWithSports;
  }

  async updateById(
    createData: ChildProfileCreateDto,
    childProfileId,
  ): Promise<ReturnChildProfileWithChildAndSportsDto> {
    //update
    await this.prisma.$queryRaw`
      UPDATE ChildProfile
      SET
      level = ${createData.level},
      regionId = ${createData.regionId},
      updatedAt = ${this.globalService.getLocalDateTime(new Date())}
      WHERE
      id = ${childProfileId};
    `;

    let updatedChildProfile: ReturnChildProfileDto =
      await this.getOneById(childProfileId);

    //if sportsIds array is provided, insert them in PlayerProfileSports
    //else do nothing
    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, updatedChildProfile.id);
    } else if (createData.sports && createData.sports.length == 0) {
      await this.deleteChildProfileSports(updatedChildProfile.id);
    }

    let newChildProfileWithSports = this.getOneDetailedByChildId(
      updatedChildProfile.childId,
    );
    return newChildProfileWithSports;
  }

  async deleteById(childProfileId: number) {
    //delete childProfileSports
    await this.deleteChildProfileSports(childProfileId);

    //delete
    await this.prisma.$queryRaw`
            DELETE FROM
            ChildProfile
            WHERE
            id = ${childProfileId};
        `;
  }

  async getOneById(childProfileId): Promise<ReturnChildProfileDto> {
    let childProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM ChildProfile
      WHERE id = ${childProfileId}
      LIMIT 1
    `;
    return childProfile[0];
  }

  async getOneDetailedById(
    childId: number,
  ): Promise<ReturnChildProfileWithChildAndSportsDto> {
    let childProfileWithSports = await this.prisma.$queryRaw`
    SELECT
    cp.id AS id,
    cp.level AS level,
    cp.regionId AS regionId,
    cp.childId AS childId,
    c.id AS childId,
    c.firstName AS firstName,
    c.lastName AS lastName,
    CASE 
    WHEN COUNT(s.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(JSON_OBJECT(
      'id',s.id,
      'name', s.name))
    END AS sports
    FROM ChildProfile AS cp
    LEFT JOIN Child AS c ON cp.childId = c.id
    LEFT JOIN ChildProfileSports AS cps ON cp.id = cps.childProfileId
    LEFT JOIN Sport AS s ON cps.sportId = s.id
    WHERE cp.id = ${childId}
    GROUP BY cp.id
    ;`;

    return childProfileWithSports[0];
  }

  async getManyByChildIds(
    childsIds: number[],
  ): Promise<ReturnChildProfileWithChildAndSportsDto[]> {
    let childProfileWithSports: ReturnChildProfileWithChildAndSportsDto[] = await this
      .prisma.$queryRaw`
    SELECT
    cp.id AS id,
    cp.level AS level,
    cp.regionId AS regionId,
    cp.childId AS childId,
    c.id AS childId,
    c.firstName AS firstName,
    c.lastName AS lastName,
    CASE 
    WHEN COUNT(s.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(JSON_OBJECT(
        'id',s.id,
        'name', s.name)) 
    END AS sports
    FROM ChildProfile AS cp
    LEFT JOIN Child AS c ON cp.childId = c.id
    LEFT JOIN ChildProfileSports AS cps ON cp.id = cps.childProfileId
    LEFT JOIN Sport AS s ON cps.sportId = s.id
    WHERE cp.childId IN (${Prisma.join(childsIds)})
    GROUP BY cp.id
    ;`;
    return childProfileWithSports;
  }

  async getOneByChildId(childId): Promise<ReturnChildProfileDto> {
    let childProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM ChildProfile
      WHERE childId = ${childId}
      LIMIT 1
    `;
    return childProfile[0];
  }

  async getOneDetailedByChildId(
    childId: number,
  ): Promise<ReturnChildProfileWithChildAndSportsDto> {
    let childProfileWithSports = await this.prisma.$queryRaw`
    SELECT
    cp.id AS id,
    cp.level AS level,
    cp.regionId AS regionId,
    cp.childId AS childId,
    c.id AS childId,
    c.firstName AS firstName,
    c.lastName AS lastName,
    CASE 
    WHEN COUNT(s.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(JSON_OBJECT(
      'id',s.id,
      'name', s.name))
    END AS sports
    FROM ChildProfile AS cp
    LEFT JOIN Child AS c ON cp.childId = c.id
    LEFT JOIN ChildProfileSports AS cps ON cp.id = cps.childProfileId
    LEFT JOIN Sport AS s ON cps.sportId = s.id
    WHERE cp.childId = ${childId}
    GROUP BY cp.id
    ;`;
    return childProfileWithSports[0];
  }

  async deleteByChildId(childId) {
    let childProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM
      ChildProfile
      WHERE
      childId = ${childId};`;

    if (childProfile[0]) {
      await this.deleteChildProfileSports(childProfile[0].id);

      await this.prisma.$queryRaw`
      DELETE FROM
      ChildProfile
      WHERE
      id = ${childProfile[0].id};`;
    }
  }

  private async deleteChildProfileSports(childProfileId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM ChildProfileSports
      WHERE childProfileId = ${childProfileId}
    `;
  }

  private async createProfileSports(sportsIds, newChildProfileId) {
    //throw an error if a sport id is not exist
    await this.sportService.checkSportsExistance(sportsIds);

    //array of objects to insert to db
    const profilesAndSports = [];
    for (let i = 0; i < sportsIds.length; i++) {
      profilesAndSports.push({
        childProfileId: newChildProfileId,
        sportId: sportsIds[i],
        // updatedAt: this.globalService.getLocalDateTime(new Date()),
        updatedAt: new Date(),
      });
    }

    // delete past PlayerProfileSports
    await this.deleteChildProfileSports(newChildProfileId);

    await this.prisma.childProfileSports.createMany({ data: profilesAndSports });
  }
}
