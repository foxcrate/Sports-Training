import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PlayerProfileCreateDto } from 'src/player-profile/dtos/create.dto';
import { ReturnPlayerProfileDto } from './dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PlayerProfileModel } from './player-profile.model';

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

    if (repeatedPlayerProfile[0]) {
      throw new BadRequestException(
        this.i18n.t(`errors.PROFILE_EXISTED`, { lang: I18nContext.current().lang }),
      );
    }
    return false;
  }
}
