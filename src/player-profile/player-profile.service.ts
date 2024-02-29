import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PlayerProfileCreateDto } from 'src/player-profile/dtos/create.dto';
import { ReturnPlayerProfileDto } from './dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerProfileModel } from './player-profile.model';
import { ReturnSportDto } from 'src/sport/dtos/return.dto';
import { GlobalService } from 'src/global/global.service';

@Injectable()
export class PlayerProfileService {
  constructor(
    private playerProfileModel: PlayerProfileModel,
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

  async set(
    createData: PlayerProfileCreateDto,
    userId: number,
  ): Promise<ReturnPlayerProfileDto> {
    let playerProfile = await this.playerProfileModel.createIfNotExist(userId);

    await this.playerProfileModel.setById(createData, playerProfile.id);
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

  private async findRepeated(userId): Promise<boolean> {
    //Chick existed email or phone number
    let repeatedPlayerProfile = await this.playerProfileModel.getOneByUserId(userId);

    if (repeatedPlayerProfile) {
      throw new BadRequestException(
        this.i18n.t(`errors.PROFILE_EXISTED`, { lang: I18nContext.current().lang }),
      );
    }
    return false;
  }
}
