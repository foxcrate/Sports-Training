import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChildProfileCreateDto } from './dtos/create.dto';
import { Prisma } from '@prisma/client';
import { ReturnChildProfileDto } from './dtos/return.dto';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';
import { ReturnChildDto } from 'src/child/dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class ChildProfileService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async create(createData: ChildProfileCreateDto, childId, userId): Promise<any> {
    //throw an error if child not exist
    let child = await this.getChildById(childId);
    if (child.userId != userId) {
      throw new ForbiddenException(
        this.i18n.t(`errors.UNAUTHORIZED`, { lang: I18nContext.current().lang }),
      );
    }
    //throw an error if repeated
    await this.findRepeated(childId);

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
    ${new Date()})`;

    let newChildProfile: ReturnChildProfileDto =
      await this.getChildProfileByChildId(childId);

    //if sportsIds array is provided, insert them in PlayerProfileSports
    //else do nothing

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, newChildProfile.id);
    }

    let newChildProfileWithSports = this.getChildProfileWithSportsByChildId(childId);
    return newChildProfileWithSports;
  }

  async update(createData: ChildProfileCreateDto, childProfileId, userId): Promise<any> {
    //check profile existance
    let childProfile = await this.authorizeResource(userId, childProfileId);

    if (!childProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    //update
    await this.prisma.$queryRaw`
      UPDATE ChildProfile
      SET
      level = ${createData.level},
      regionId = ${createData.regionId},
      updatedAt = ${new Date()}
      WHERE
      id = ${childProfileId};
    `;

    let updatedChildProfile: ReturnChildProfileDto = await this.getById(childProfileId);

    //if sportsIds array is provided, insert them in PlayerProfileSports
    //else do nothing
    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, updatedChildProfile.id);
    } else if (createData.sports && createData.sports.length == 0) {
      await this.deletePastChildSports(childProfile.id);
    }

    let newChildProfileWithSports = this.getChildProfileWithSportsByChildId(
      childProfile.childId,
    );
    return newChildProfileWithSports;
  }

  async delete(userId, childProfileId): Promise<any> {
    // return the childProfile or throw unauthorized error
    let childProfile = await this.authorizeResource(userId, childProfileId);

    let deletedChildProfile: ReturnChildProfileDto = await this.getById(childProfileId);

    //delete childProfileSports
    await this.deletePastChildSports(childProfile.id);

    //delete
    await this.prisma.$queryRaw`
        DELETE FROM
        ChildProfile
        WHERE
        id = ${childProfile.id};
    `;

    //return it serialized
    return deletedChildProfile;
  }

  async getAll(userId): Promise<any> {
    //get all user's childs
    let childsIds = await this.getUserChildsIds(userId);

    // console.log({ childsIds });

    //return empty array if childsIds is empty
    if (childsIds.length == 0) {
      return [];
    }

    let childsProfilesWithSports = this.getChildsProfilesWithSportsByChildIds(childsIds);
    return childsProfilesWithSports;
  }

  async getOne(userId, childProfileId): Promise<any> {
    // return the childProfile or throw unauthorized error
    let childProfile = await this.authorizeResource(userId, childProfileId);

    //get childProfile

    let childProfileWithSports = this.getChildProfileWithSportsByChildId(
      childProfile.childId,
    );
    return childProfileWithSports;
  }

  private async findRepeated(childId): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedChildProfile = await this.prisma.$queryRaw`
    SELECT *
    FROM ChildProfile
    WHERE childId = ${childId}
    LIMIT 1
    `;

    if (repeatedChildProfile[0]) {
      throw new BadRequestException(
        this.i18n.t(`errors.PROFILE_EXISTED`, { lang: I18nContext.current().lang }),
      );
    }
    return false;
  }

  private async createProfileSports(sportsIds, newChildProfileId) {
    //throw an error if a sport id is not exist
    await this.checkSportsExistance(sportsIds);

    //array of objects to insert to db
    const profilesAndSports = [];
    for (let i = 0; i < sportsIds.length; i++) {
      profilesAndSports.push({
        childProfileId: newChildProfileId,
        sportId: sportsIds[i],
        updatedAt: new Date(),
      });
    }

    // delete past PlayerProfileSports
    await this.deletePastChildSports(newChildProfileId);

    await this.prisma.childProfileSports.createMany({ data: profilesAndSports });
  }

  private async checkSportsExistance(sportsArray): Promise<Boolean> {
    let foundedSports: Array<ReturnSportDto> = await this.prisma.$queryRaw`
    SELECT *
    FROM Sport
    WHERE id IN (${Prisma.join(sportsArray)});
    `;

    if (foundedSports.length < sportsArray.length) {
      throw new BadRequestException(
        this.i18n.t(`errors.NOT_EXISTED_SPORT`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }

  private async getLastCreated(): Promise<ReturnChildProfileDto> {
    let childProfile = await this.prisma.$queryRaw`
    SELECT *
    FROM ChildProfile
    ORDER BY createdAt DESC
    LIMIT 1`;
    return childProfile[0];
  }

  private async getLastUpdated(): Promise<ReturnChildProfileDto> {
    let childProfile = await this.prisma.$queryRaw`
    SELECT *
    FROM ChildProfile
    ORDER BY updatedAt DESC
    LIMIT 1`;
    return childProfile[0];
  }

  private async getChildById(childId): Promise<ReturnChildDto> {
    let theChild = await this.prisma.$queryRaw`
      SELECT *
      FROM Child
      WHERE id = ${childId}
      LIMIT 1
    `;

    if (!theChild[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }
    return theChild[0];
  }

  private async getById(childProfileId): Promise<any> {
    let childProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM ChildProfile
      WHERE id = ${childProfileId}
      LIMIT 1
    `;
    return childProfile[0];
  }

  private async getChildProfileWithSportsByChildId(
    childId: number,
  ): Promise<ReturnChildProfileDto> {
    let childProfileWithSports: any = await this.prisma.$queryRaw`
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
      'enName', s.enName,
      'arName', s.arName)) 
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

  private async getChildsProfilesWithSportsByChildIds(
    childsIds: number[],
  ): Promise<ReturnChildProfileDto> {
    // console.log({ childsIds });

    let childProfileWithSports: any = await this.prisma.$queryRaw`
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
      'enName', s.enName,
      'arName', s.arName)) 
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

  private async getChildProfileByChildId(childId): Promise<any> {
    let childProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM ChildProfile
      WHERE childId = ${childId}
      LIMIT 1
    `;
    return childProfile[0];
  }

  private async deletePastChildSports(childProfileId: number): Promise<any> {
    await this.prisma.$queryRaw`
      DELETE
      FROM ChildProfileSports
      WHERE childProfileId = ${childProfileId}
    `;
  }

  private async getUserChildsIds(userId: number): Promise<number[]> {
    let idsObject: any = await this.prisma.$queryRaw`
      SELECT id
      FROM Child
      WHERE userId = ${userId}
    `;

    // console.log({ idsObject });

    let childsIds = idsObject.map((obj) => {
      return obj.id;
    });
    return childsIds;
  }

  private async authorizeResource(
    userId: number,
    childProfileId: number,
  ): Promise<ReturnChildProfileDto> {
    //get childProfile
    let childProfile = await this.getById(childProfileId);
    if (!childProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }
    let childId = childProfile.childId;

    //get current user childs
    // console.log({ userId });

    let childsIds = await this.getUserChildsIds(userId);
    // console.log({ childsIds });

    childId = parseInt(childId);

    // check if the child is the current user's child
    if (!childsIds.includes(childId)) {
      throw new ForbiddenException(
        this.i18n.t(`errors.UNAUTHORIZED`, { lang: I18nContext.current().lang }),
      );
    }
    return childProfile;
  }
}
