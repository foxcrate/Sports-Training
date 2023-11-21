import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TrainerProfileCreateDto } from 'src/trainer-profile/dtos/create.dto';
import { Prisma } from '@prisma/client';
import { ReturnTrainerProfileDto } from './dtos/return.dto';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { TrainerProfileModel } from './trainer-profile.model';

@Injectable()
export class TrainerProfileService {
  constructor(
    private prisma: PrismaService,
    private globalService: GlobalService,
    private trainerProfileModel: TrainerProfileModel,
    private readonly i18n: I18nService,
  ) {}

  async getOne(userId): Promise<ReturnTrainerProfileDto> {
    let trainerProfileWithSports = await this.trainerProfileModel.getOneDetailed(userId);
    if (!trainerProfileWithSports) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return trainerProfileWithSports;
  }

  async create(createData: TrainerProfileCreateDto, userId): Promise<any> {
    // console.log(createData);
    // return createData;

    await this.trainerProfileModel.findRepeated(userId);

    return await this.trainerProfileModel.create(createData, userId);
  }

  async update(
    createData: TrainerProfileCreateDto,
    userId,
  ): Promise<ReturnTrainerProfileDto> {
    //check profile existence
    let trainerProfile = await this.trainerProfileModel.getByUserId(userId);
    if (!trainerProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    //update
    await this.prisma.$queryRaw`
      UPDATE PlayerProfile
      SET
      regionId = ${createData.regionId},
      updatedAt = ${this.globalService.getLocalDateTime(new Date())}
      WHERE
      userId = ${userId};
    `;

    // if (createData.sports && createData.sports.length > 0) {
    //   await this.createProfileSports(createData.sports, playerProfile.id);
    // } else if (createData.sports && createData.sports.length == 0) {
    //   await this.deletePastPlayerSports(playerProfile.id);
    // }

    let updatedPlayerProfile = await this.getPlayerProfileWithSportsByUserId(userId);

    return updatedPlayerProfile;
  }

  async delete(userId): Promise<ReturnTrainerProfileDto> {
    //get deleted playerProfile
    let deletedPlayerProfile = await this.getByUserId(userId);

    if (!deletedPlayerProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
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

    return deletedPlayerProfile;
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
        // updatedAt: this.globalService.getLocalDateTime(new Date()),
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
      throw new NotFoundException(
        this.i18n.t(`errors.NOT_EXISTED_SPORT`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }

  private async getLastCreated(): Promise<ReturnTrainerProfileDto> {
    let playerProfileWithSports = await this.prisma.$queryRaw`
    SELECT
      pp.id AS id,
      pp.level AS level,
      pp.regionId AS regionId,
      pp.userId AS userId,
      JSON_ARRAYAGG(json_object(
        'id',s.id,
        'name', s.name))
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

  private async getLastUpdated(): Promise<ReturnTrainerProfileDto> {
    let playerProfile = await this.prisma.$queryRaw`
    SELECT *
    FROM PlayerProfile
    ORDER BY updatedAt DESC
    LIMIT 1`;
    return playerProfile[0];
  }

  private async getByUserId(userId): Promise<ReturnTrainerProfileDto> {
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
  ): Promise<ReturnTrainerProfileDto> {
    let playerProfileWithSports = await this.prisma.$queryRaw`
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
      'name', s.name)) 
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

  private async deletePastPlayerSports(playerProfileId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM PlayerProfileSports
      WHERE playerProfileId = ${playerProfileId}
    `;
  }
}
