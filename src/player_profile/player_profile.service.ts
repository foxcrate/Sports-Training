import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlayerProfileCreateDto } from 'src/player_profile/dtos/create.dto';
import { NewBadRequestException } from 'src/exceptions/new_bad_request.exception';
import { Prisma } from '@prisma/client';
import { ReturnPlayerProfileSerializer } from './serializers/return.serializer';

@Injectable()
export class PlayerProfileService {
  constructor(private prisma: PrismaService) {}

  async getOne(userId): Promise<any> {
    let playerProfile = await this.getByUserId(userId);
    if (!playerProfile) {
      throw new NewBadRequestException('RECORD_NOT_FOUND');
    }

    return new ReturnPlayerProfileSerializer().serialize(playerProfile);
  }

  async create(createData: PlayerProfileCreateDto, userId): Promise<any> {
    //throw an error if repeated
    await this.findRepeated(userId);

    //insert
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
    ${new Date()})`;

    let newPlayerProfile: any = await this.getLastCreated();

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, newPlayerProfile[0].id);
    }

    return new ReturnPlayerProfileSerializer().serialize(newPlayerProfile[0]);
  }

  async update(createData: PlayerProfileCreateDto, userId): Promise<any> {
    //check profile existence
    let playerProfile = await this.getByUserId(userId);
    if (!playerProfile) {
      throw new NewBadRequestException('RECORD_NOT_FOUND');
    }

    //update
    await this.prisma.$queryRaw`
      UPDATE PlayerProfile
      SET
      level = ${createData.level},
      regionId = ${createData.regionId},
      updatedAt = ${new Date()}
      WHERE
      userId = ${userId};
    `;

    let updatedPlayerProfile: any = await this.getLastUpdated();

    //if sportsIds array is provided, insert them in PlayerProfileSports
    //else do nothing

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, updatedPlayerProfile[0].id);
    } else if (createData.sports && createData.sports.length == 0) {
      await this.deletePastPlayerSports(updatedPlayerProfile[0].id);
    }

    return new ReturnPlayerProfileSerializer().serialize(updatedPlayerProfile[0]);
  }

  async delete(userId): Promise<any> {
    //get deleted playerProfile
    let deletedPlayerProfile = await this.getByUserId(userId);

    //delete playerProfileSports
    await this.deletePastPlayerSports(deletedPlayerProfile.id);

    //delete
    await this.prisma.$queryRaw`
      DELETE FROM
      PlayerProfile
      WHERE
      userId = ${userId};
    `;

    return new ReturnPlayerProfileSerializer().serialize(deletedPlayerProfile);
  }

  private async findRepeated(userId): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedPlayerProfile = await this.prisma.$queryRaw`SELECT *
    FROM PlayerProfile
    WHERE userId = ${userId}
    LIMIT 1
    `;

    if (repeatedPlayerProfile[0]) {
      throw new NewBadRequestException('PROFILE_EXISTED');
    }
    return false;
  }

  private async createProfileSports(sportsIds, newPlayerProfileId) {
    //throw an error if a sport id is not exist
    await this.checkSportsExistance(sportsIds);

    //array of objects to insert to db
    const profilesAndSports = [];
    for (let i = 0; i < sportsIds.length; i++) {
      profilesAndSports.push({
        playerProfileId: newPlayerProfileId,
        sportId: sportsIds[i],
        updatedAt: new Date(),
      });
    }

    //delete past PlayerProfileSports
    await this.deletePastPlayerSports(newPlayerProfileId);

    await this.prisma.playerProfileSports.createMany({ data: profilesAndSports });
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
    return await this.prisma.$queryRaw`
    SELECT *
    FROM PlayerProfile
    ORDER BY createdAt DESC
    LIMIT 1`;
  }

  private async getLastUpdated(): Promise<any> {
    return await this.prisma.$queryRaw`
    SELECT *
    FROM PlayerProfile
    ORDER BY updatedAt DESC
    LIMIT 1`;
  }

  private async getByUserId(userId): Promise<any> {
    let playerProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM PlayerProfile
      WHERE userId = ${userId}
      LIMIT 1
    `;
    // if (playerProfile[0]) {
    return playerProfile[0];
    // } else {
    //   console.log('exception --');
    //   throw new NewBadRequestException('RECORD_NOT_FOUND');
    // }
  }

  private async deletePastPlayerSports(playerProfileId: number): Promise<any> {
    await this.prisma.$queryRaw`
      DELETE
      FROM PlayerProfileSports
      WHERE playerProfileId = ${playerProfileId}
    `;
  }
}
