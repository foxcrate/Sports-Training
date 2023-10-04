import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlayerProfileCreateDto } from 'src/player-profile/dtos/create.dto';
import { NewBadRequestException } from 'src/exceptions/new-bad-request.exception';
import { Prisma } from '@prisma/client';
import { ReturnPlayerProfileSerializer } from './serializers/return.serializer';
import { ReturnPlayerProfileDto } from './dtos/return.dto';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';
import { GlobalService } from 'src/global/global.service';

@Injectable()
export class PlayerProfileService {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
  ) {}

  async getOne(userId): Promise<any> {
    // let playerProfile = await this.getByUserId(userId);
    // if (!playerProfile) {
    //   // throw new NewBadRequestException('RECORD_NOT_FOUND');
    //   throw new NotFoundException(this.globalService.getError('en', 'RECORD_NOT_FOUND'));
    // }
    let playerProfileWithSports = await this.getPlayerProfileWithSportsByUserId(userId);
    if (!playerProfileWithSports) {
      throw new NotFoundException(this.globalService.getError('en', 'RECORD_NOT_FOUND'));
    }

    return playerProfileWithSports;
    // return new ReturnPlayerProfileSerializer().serialize(playerProfile);
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

    let newPlayerProfile = await this.getByUserId(userId);

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, newPlayerProfile.id);
    }

    let newPlayerProfileWithSports: any =
      await this.getPlayerProfileWithSportsByUserId(userId);

    // return new ReturnPlayerProfileSerializer().serialize(newPlayerProfile);
    return newPlayerProfileWithSports;
  }

  async update(createData: PlayerProfileCreateDto, userId): Promise<any> {
    //check profile existence
    // let playerProfile = await this.getByUserId(userId);
    let playerProfile: any = await this.getPlayerProfileWithSportsByUserId(userId);
    if (!playerProfile) {
      // throw new NewBadRequestException('RECORD_NOT_FOUND');
      throw new NotFoundException(this.globalService.getError('en', 'RECORD_NOT_FOUND'));
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

    // let updatedPlayerProfile: any = await this.getLastUpdated();

    //if sportsIds array is provided, insert them in PlayerProfileSports
    //else do nothing

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, playerProfile.id);
    } else if (createData.sports && createData.sports.length == 0) {
      await this.deletePastPlayerSports(playerProfile.id);
    }

    let updatedPlayerProfile: any = await this.getPlayerProfileWithSportsByUserId(userId);

    return updatedPlayerProfile;
    // return new ReturnPlayerProfileSerializer().serialize(updatedPlayerProfile);
  }

  async delete(userId): Promise<any> {
    //get deleted playerProfile
    let deletedPlayerProfile = await this.getByUserId(userId);

    if (!deletedPlayerProfile) {
      throw new NotFoundException(this.globalService.getError('en', 'RECORD_NOT_FOUND'));
    }

    //delete playerProfileSports
    await this.deletePastPlayerSports(deletedPlayerProfile.id);

    //delete
    await this.prisma.$queryRaw`
      DELETE FROM
      PlayerProfile
      WHERE
      userId = ${userId};
    `;

    // return new ReturnPlayerProfileSerializer().serialize(deletedPlayerProfile);
    return deletedPlayerProfile;
  }

  private async findRepeated(userId): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedPlayerProfile = await this.prisma.$queryRaw`
    SELECT *
    FROM PlayerProfile
    WHERE userId = ${userId}
    LIMIT 1
    `;

    if (repeatedPlayerProfile[0]) {
      // throw new NewBadRequestException('PROFILE_EXISTED');
      throw new BadRequestException(this.globalService.getError('en', 'PROFILE_EXISTED'));
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
    let foundedSports: Array<ReturnSportDto> = await this.prisma.$queryRaw`
    SELECT *
    FROM Sport
    WHERE id IN (${Prisma.join(sportsArray)});
    `;

    if (foundedSports.length < sportsArray.length) {
      // throw new NewBadRequestException('NOT_EXISTED_SPORT');
      throw new NotFoundException(this.globalService.getError('en', 'NOT_EXISTED_SPORT'));
    }
    return true;
  }

  private async getLastCreated(): Promise<ReturnPlayerProfileDto> {
    // let playerProfile = await this.prisma.$queryRaw`
    // SELECT *
    // FROM PlayerProfile
    // ORDER BY createdAt DESC
    // LIMIT 1`;

    let playerProfileWithSports = await this.prisma.$queryRaw`
    SELECT
      pp.id AS id,
      pp.level AS level,
      pp.regionId AS regionId,
      pp.userId AS userId,
      JSON_ARRAYAGG(json_object(
        'id',s.id,
        'enName', s.enName,
        'arName', s.arName))
    AS sports
    FROM PlayerProfile AS pp
    JOIN PlayerProfileSports AS pps ON pp.id = pps.playerProfileId
    JOIN Sport AS s ON pps.sportId = s.id
    GROUP BY pp.id
    ORDER BY createdAt DESC
    LIMIT 1
    `;

    // return playerProfile[0];
    return playerProfileWithSports[0];
  }

  private async getLastUpdated(): Promise<ReturnPlayerProfileDto> {
    let playerProfile = await this.prisma.$queryRaw`
    SELECT *
    FROM PlayerProfile
    ORDER BY updatedAt DESC
    LIMIT 1`;
    return playerProfile[0];
  }

  private async getByUserId(userId): Promise<ReturnPlayerProfileDto> {
    let playerProfile = await this.prisma.$queryRaw`
      SELECT *
      FROM PlayerProfile
      WHERE userId = ${userId}
      LIMIT 1
    `;
    return playerProfile[0];
  }

  private async getPlayerProfileWithSportsByUserId(
    userId,
  ): Promise<ReturnPlayerProfileDto> {
    let playerProfileWithSports: any = await this.prisma.$queryRaw`
    SELECT
    pp.id AS id,
    pp.level AS level,
    pp.regionId AS regionId,
    pp.userId AS userId,
    CASE 
    WHEN COUNT(s.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(JSON_OBJECT(
      'id',s.id,
      'enName', s.enName,
      'arName', s.arName)) 
    END AS sports
    FROM PlayerProfile AS pp
    LEFT JOIN PlayerProfileSports AS pps ON pp.id = pps.playerProfileId
    LEFT JOIN Sport AS s ON pps.sportId = s.id
    WHERE pp.userId = ${userId}
    GROUP BY pp.id
    LIMIT 1
    ;`;
    return playerProfileWithSports[0];
  }

  private async deletePastPlayerSports(playerProfileId: number): Promise<any> {
    await this.prisma.$queryRaw`
      DELETE
      FROM PlayerProfileSports
      WHERE playerProfileId = ${playerProfileId}
    `;
  }
}
