import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PlayerProfileCreateDto } from 'src/player-profile/dtos/create.dto';
import { ReturnPlayerProfileDto } from './dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerProfileModel } from './player-profile.model';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';

@Injectable()
export class PlayerProfileService {
  constructor(
    private playerProfileModel: PlayerProfileModel,
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async getOne(userId): Promise<ReturnPlayerProfileDto> {
    let playerProfileWithSports =
      await this.playerProfileModel.getOneDetailedByUserId(userId);
    if (!playerProfileWithSports) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return playerProfileWithSports;
  }

  async create(
    createData: PlayerProfileCreateDto,
    userId,
  ): Promise<ReturnPlayerProfileDto> {
    //throw an error if repeated
    await this.findRepeated(userId);

    await this.playerProfileModel.create(createData, userId);

    return await this.playerProfileModel.getOneDetailedByUserId(userId);
  }

  async update(
    createData: PlayerProfileCreateDto,
    userId,
  ): Promise<ReturnPlayerProfileDto> {
    //check profile existence
    let playerProfile = await this.playerProfileModel.getOneDetailedByUserId(userId);
    if (!playerProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    await this.playerProfileModel.updateById(createData, playerProfile.id);

    return await this.playerProfileModel.getOneDetailedByUserId(userId);
  }

  async delete(userId): Promise<ReturnPlayerProfileDto> {
    //get deleted playerProfile
    let deletedPlayerProfile = await this.playerProfileModel.getOneByUserId(userId);

    if (!deletedPlayerProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    //delete playerProfileSports
    await this.playerProfileModel.deletePlayerSports(deletedPlayerProfile.id);

    await this.playerProfileModel.deleteByUserId(userId);

    return deletedPlayerProfile;
  }

  private async findRepeated(userId): Promise<Boolean> {
    //Chick existed email or phone number
    let repeatedPlayerProfile = await this.playerProfileModel.getOneByUserId(userId);

    if (repeatedPlayerProfile) {
      throw new BadRequestException(
        this.i18n.t(`errors.PROFILE_EXISTED`, { lang: I18nContext.current().lang }),
      );
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
      r.name AS region,
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
    FROM UserDetails AS ud
    LEFT JOIN playerProfileWithSports AS pps
    ON pps.userId = ud.id
    GROUP BY ud.id
    `;
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
