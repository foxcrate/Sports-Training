import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PlayerProfileCreateDto } from 'src/player-profile/dtos/create.dto';
import { ReturnPlayerProfileDto } from './dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PlayerProfileRepository } from './player-profile.repository';

@Injectable()
export class PlayerProfileService {
  constructor(
    private playerProfileRepository: PlayerProfileRepository,
    private readonly i18n: I18nService,
  ) {}

  async getOne(userId): Promise<ReturnPlayerProfileDto> {
    let playerProfileWithSports =
      await this.playerProfileRepository.getOneDetailedByUserId(userId);
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
    let playerProfile = await this.playerProfileRepository.createIfNotExist(userId);

    await this.playerProfileRepository.setById(createData, playerProfile.id);
    return await this.playerProfileRepository.getOneDetailedByUserId(userId);
  }

  async delete(userId): Promise<ReturnPlayerProfileDto> {
    //get deleted playerProfile
    let deletedPlayerProfile = await this.playerProfileRepository.getOneByUserId(userId);

    if (!deletedPlayerProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    //delete playerProfileSports
    await this.playerProfileRepository.deletePlayerSports(deletedPlayerProfile.id);

    await this.playerProfileRepository.deleteByUserId(userId);

    return deletedPlayerProfile;
  }

  private async findRepeated(userId): Promise<boolean> {
    //Chick existed email or phone number
    let repeatedPlayerProfile = await this.playerProfileRepository.getOneByUserId(userId);

    if (repeatedPlayerProfile) {
      throw new BadRequestException(
        this.i18n.t(`errors.PROFILE_EXISTED`, { lang: I18nContext.current().lang }),
      );
    }
    return false;
  }
}
