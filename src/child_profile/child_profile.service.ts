import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChildProfileCreateDto } from './dtos/create.dto';
import { NewBadRequestException } from 'src/exceptions/new_bad_request.exception';
import { Prisma } from '@prisma/client';
import { ReturnChildProfileSerializer } from './serializers/return.serializer';

@Injectable()
export class ChildProfileService {
  constructor(private prisma: PrismaService) {}

  async create(createData: ChildProfileCreateDto, childId, userId): Promise<any> {
    //throw an error if child not exist
    await this.getChildById(childId);

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

    let newChildProfile: any = await this.getLastCreated();

    //if sportsIds array is provided, insert them in PlayerProfileSports
    //else do nothing
    // createData.sports
    //   ? await this.createProfileSports(createData.sports, newPlayerProfile[0].id)
    //   : undefined;

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, newChildProfile.id);
    }

    return new ReturnChildProfileSerializer().serialize(newChildProfile);
  }

  async update(createData: ChildProfileCreateDto, childProfileId, userId): Promise<any> {
    //check profile existance
    let childProfile = await this.authorizeResource(userId, childProfileId);

    if (!childProfile) {
      throw new NewBadRequestException('RECORD_NOT_FOUND');
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

    let updatedChildProfile: any = await this.getLastUpdated();

    //if sportsIds array is provided, insert them in PlayerProfileSports
    //else do nothing
    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, updatedChildProfile.id);
    } else if (createData.sports && createData.sports.length == 0) {
      await this.deletePastChildSports(childProfile.id);
    }

    return new ReturnChildProfileSerializer().serialize(updatedChildProfile);
  }

  async delete(userId, childProfileId): Promise<any> {
    // return the childProfile or throw unauthorized error
    let childProfile = await this.authorizeResource(userId, childProfileId);

    //serialize it
    let deletedChildProfile = new ReturnChildProfileSerializer().serialize(childProfile);

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

    //return empty array if childsIds is empty
    if (childsIds.length == 0) {
      return [];
    }

    //select all child's profile
    let childProfiles = await this.prisma.$queryRaw`
    SELECT *
    FROM ChildProfile
    WHERE childId IN (${Prisma.join(childsIds)});
    `;

    //return them serialized
    return new ReturnChildProfileSerializer().serialize(childProfiles);
  }

  async getOne(userId, childProfileId): Promise<any> {
    // return the childProfile or throw unauthorized error
    let childProfile = await this.authorizeResource(userId, childProfileId);

    //get childProfile
    // let childProfile = await this.getById(childProfileId);

    //return them serialized
    return new ReturnChildProfileSerializer().serialize(childProfile);
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
      throw new NewBadRequestException('PROFILE_EXISTED');
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
    let foundedSports: Array<any> = await this.prisma.$queryRaw`
    SELECT *
    FROM Sport
    WHERE id IN (${Prisma.join(sportsArray)});
    `;

    if (foundedSports.length < sportsArray.length) {
      throw new NewBadRequestException('NOT_EXISTED_SPORT');
    }
    return true;
  }

  private async getLastCreated(): Promise<any> {
    let childProfile = await this.prisma.$queryRaw`
    SELECT *
    FROM ChildProfile
    ORDER BY createdAt DESC
    LIMIT 1`;
    return childProfile[0];
  }

  private async getLastUpdated(): Promise<any> {
    let childProfile = await this.prisma.$queryRaw`
    SELECT *
    FROM ChildProfile
    ORDER BY updatedAt DESC
    LIMIT 1`;
    return childProfile[0];
  }

  private async getChildById(childId): Promise<any> {
    let theChild = await this.prisma.$queryRaw`
      SELECT *
      FROM Child
      WHERE id = ${childId}
      LIMIT 1
    `;

    if (!theChild[0]) {
      throw new NewBadRequestException('RECORD_NOT_FOUND');
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

  private async deletePastChildSports(childProfileId: number): Promise<any> {
    await this.prisma.$queryRaw`
      DELETE
      FROM ChildProfileSports
      WHERE childProfileId = ${childProfileId}
    `;
  }

  private async getUserChildsIds(userId: number): Promise<any> {
    let idsObject: any = await this.prisma.$queryRaw`
      SELECT id
      FROM Child
      WHERE userId = ${userId}
    `;
    let childsIds = idsObject.map((obj) => {
      return obj.id;
    });
    return childsIds;
  }

  private async authorizeResource(userId: number, childProfileId: number): Promise<any> {
    //get childProfile
    let childProfile = await this.getById(childProfileId);
    if (!childProfile) {
      throw new NewBadRequestException('RECORD_NOT_FOUND');
    }
    let childId = childProfile.childId;

    //get current user childs
    let childsIds = await this.getUserChildsIds(userId);
    childId = parseInt(childId);

    //check if the child is the current user's child
    if (!childsIds.includes(childId)) {
      throw new NewBadRequestException('UNAUTHORIZED');
    }
    return childProfile;
  }
}
