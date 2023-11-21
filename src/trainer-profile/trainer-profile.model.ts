import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GlobalService } from 'src/global/global.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ReturnTrainerProfileDto } from './dtos/return.dto';
import { ReturnTrainerProfileDetailsDto } from './dtos/details-return.dto';
import { TrainerProfileCreateDto } from './dtos/create.dto';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';
import { Prisma } from '@prisma/client';
import { FieldReturnDto } from 'src/field/dtos/return.dto';

@Injectable()
export class TrainerProfileModel {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private readonly i18n: I18nService,
    private globalSerice: GlobalService,
  ) {}

  async getByUserId(userId: number): Promise<ReturnTrainerProfileDto> {
    let trainerProfile = await this.prisma.$queryRaw`
    SELECT
      id,
      level,
      ageGroup,
      sessionDescription,
      userId,
      createdAt
    FROM TrainerProfile AS tp
    WHERE tp.userId = ${userId}
    LIMIT 1
    ;`;

    if (!trainerProfile[0]) {
      throw new NotFoundException(
        this.i18n.t(`errors.TRAINER_PROFILE_NOT_FOUND`, {
          lang: I18nContext.current().lang,
        }),
      );
    }

    return trainerProfile[0];
  }

  async getOneDetailed(userId: number): Promise<ReturnTrainerProfileDetailsDto> {
    let trainerProfileDetails: ReturnTrainerProfileDetailsDto = await this.prisma
      .$queryRaw`
    SELECT
    tp.id AS id,
    tp.level AS level,
    tp.regionId AS regionId,
    tp.userId AS userId,
    CASE 
    WHEN COUNT(s.id ) = 0 THEN null
    ELSE
    JSON_ARRAYAGG(JSON_OBJECT(
      'id',s.id,
      'name', s.name)) 
    END AS sports
    FROM TrainerProfile AS tp
    LEFT JOIN TrainerProfileSports AS tps ON tp.id = tps.trainerProfileId
    LEFT JOIN Sport AS s ON tps.sportId = s.id
    WHERE tp.userId = ${userId}
    GROUP BY tp.id
    LIMIT 1
    ;`;
    return trainerProfileDetails[0];
  }

  async getSchedulesIds(userId: number): Promise<number[]> {
    let trainerProfile = await this.getByUserId(userId);

    let schedulesIds = await this.prisma.$queryRaw`
    SELECT
    JSON_ARRAYAGG(id) as ids
    FROM Schedule AS s
    WHERE s.trainerProfileId = ${trainerProfile.id}
    ;`;

    let schedulesIdsArray = schedulesIds[0].ids;

    return schedulesIdsArray;
  }

  async create(
    createData: TrainerProfileCreateDto,
    userId,
  ): Promise<ReturnTrainerProfileDto> {
    await this.prisma.$queryRaw`
    INSERT INTO TrainerProfile
    (
      level,
      ageGroup,
      sessionDescription,
      regionId,
      userId
    )
      VALUES
    (
      ${createData.level},
      ${createData.ageGroup},
      ${createData.sessionDescription},
      ${createData.regionId},
      ${userId}
    )
    `;

    let newTrainerProfile = await this.getByUserId(userId);

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, newTrainerProfile.id);
    }

    if (createData.fields && createData.fields.length > 0) {
      await this.createProfileFields(createData.fields, newTrainerProfile.id);
    }

    return newTrainerProfile;
  }

  async update(
    createData: TrainerProfileCreateDto,
    userId,
  ): Promise<ReturnTrainerProfileDto> {
    let theTrainerProfile = await this.getByUserId(userId);
    //update
    await this.prisma.$queryRaw`
      UPDATE TrainerProfile
      SET
      level = ${createData.level}
      ageGroup = ${createData.ageGroup}
      sessionDescription = ${createData.sessionDescription}
      regionId = ${createData.regionId}
      WHERE
      userId = ${userId};
    `;

    //if sportsIds array is provided, insert them in TrainerProfileSports
    //else do nothing

    if (createData.sports && createData.sports.length > 0) {
      await this.createProfileSports(createData.sports, theTrainerProfile.id);
    } else if (createData.sports && createData.sports.length == 0) {
      await this.deletePastPlayerSports(playerProfile.id);
    }

    let updatedPlayerProfile = await this.getPlayerProfileWithSportsByUserId(userId);

    return updatedPlayerProfile;
  }

  async findRepeated(userId): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedTrainerProfile = await this.prisma.$queryRaw`
    SELECT *
    FROM TrainerProfile
    WHERE userId = ${userId}
    LIMIT 1
    `;

    if (repeatedTrainerProfile[0]) {
      throw new BadRequestException(
        this.i18n.t(`errors.PROFILE_EXISTED`, { lang: I18nContext.current().lang }),
      );
    }
    return false;
  }

  private async createProfileSports(sportsIds, newTrainerProfileId) {
    //throw an error if a sport id is not exist
    await this.checkSportsExistance(sportsIds);

    //array of objects to insert to db
    const profilesAndSports = [];
    for (let i = 0; i < sportsIds.length; i++) {
      profilesAndSports.push({
        trainerProfileId: newTrainerProfileId,
        sportId: sportsIds[i],
      });
    }

    //delete past PlayerProfileSports
    await this.deletePastTrainerSports(newTrainerProfileId);

    await this.prisma.trainerProfileSports.createMany({ data: profilesAndSports });
  }

  private async createProfileFields(fieldsIds, newTrainerProfileId) {
    //throw an error if a sport id is not exist
    await this.checkFieldsExistance(fieldsIds);

    //array of objects to insert to db
    const profilesAndFields = [];
    for (let i = 0; i < fieldsIds.length; i++) {
      profilesAndFields.push({
        trainerProfileId: newTrainerProfileId,
        fieldId: fieldsIds[i],
      });
    }

    //delete past PlayerProfileSports
    await this.deletePastTrainerSports(newTrainerProfileId);

    await this.prisma.trainerProfileFields.createMany({ data: profilesAndFields });
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

  private async checkFieldsExistance(fieldsArray): Promise<Boolean> {
    let foundedFields: Array<FieldReturnDto> = await this.prisma.$queryRaw`
    SELECT *
    FROM Field
    WHERE id IN (${Prisma.join(fieldsArray)});
    `;

    if (foundedFields.length < fieldsArray.length) {
      throw new NotFoundException(
        this.i18n.t(`errors.NOT_EXISTED_FIELD`, { lang: I18nContext.current().lang }),
      );
    }
    return true;
  }

  private async deletePastTrainerSports(trainerProfileId: number) {
    await this.prisma.$queryRaw`
      DELETE
      FROM TrainerProfileFields
      WHERE trainerProfileId = ${trainerProfileId}
    `;
  }
}
