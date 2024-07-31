import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlayerProfileCreateDto } from '../player-profile/dtos/create.dto';
import { ReturnPlayerProfileDto } from '../player-profile/dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ReturnPlayerProfileWithUserAndSportsDto } from '../player-profile/dtos/return-with-user-and-sports.dto';
import { PlayerProfileRepository } from '../player-profile/player-profile.repository';
import { UserRepository } from 'src/user/user.repository';
import { PlayerProfileService } from 'src/player-profile/player-profile.service';

@Injectable()
export class ChildProfileService {
  constructor(
    private userRepository: UserRepository,
    private playerProfileRepository: PlayerProfileRepository,
    private playerProfileService: PlayerProfileService,
    private readonly i18n: I18nService,
  ) {}

  async create(
    createData: PlayerProfileCreateDto,
    childId,
    userId,
  ): Promise<ReturnPlayerProfileDto> {
    let child = await this.userRepository.getById(childId);

    if (!child) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    if (!(await this.userRepository.isMyChild(userId, child.id))) {
      throw new ForbiddenException(
        this.i18n.t(`errors.NOT_ALLOWED`, { lang: I18nContext.current().lang }),
      );
    }

    await this.findRepeated(childId);

    await this.playerProfileService.set(createData, childId);

    return await this.playerProfileRepository.getOneDetailedByUserId(childId);
  }

  async update(
    createData: PlayerProfileCreateDto,
    childProfileId,
    userId,
  ): Promise<ReturnPlayerProfileDto> {
    //check profile existance
    let childProfile = await this.authorizeResource(userId, childProfileId);

    if (!childProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    await this.playerProfileRepository.updateById(createData, childProfile.id);
    return await this.playerProfileRepository.getOneDetailedByUserId(childProfile.userId);
  }

  async delete(userId, childProfileId): Promise<ReturnPlayerProfileDto> {
    // return the childProfile or throw unauthorized error
    await this.authorizeResource(userId, childProfileId);

    let deletedChildProfile: ReturnPlayerProfileDto =
      await this.playerProfileRepository.getOneById(childProfileId);

    await this.playerProfileRepository.deleteById(deletedChildProfile.id);

    return deletedChildProfile;
  }

  async getAll(userId): Promise<ReturnPlayerProfileWithUserAndSportsDto[]> {
    //get all user's childs
    let childsIds = await this.userRepository.getChildsIds(userId);

    //return empty array if childsIds is empty
    if (childsIds.length == 0) {
      return [];
    }

    return await this.playerProfileRepository.getManyByUserIds(childsIds);
  }

  async getOne(userId, childProfileId): Promise<ReturnPlayerProfileWithUserAndSportsDto> {
    // return the childProfile or throw unauthorized error
    let childProfile = await this.authorizeResource(userId, childProfileId);

    //get childProfile

    return await this.playerProfileRepository.getOneDetailedById(childProfile.id);
  }

  private async findRepeated(childId): Promise<boolean> {
    let repeatedChildProfile = await this.playerProfileRepository.getOneByUserId(childId);

    if (repeatedChildProfile) {
      throw new BadRequestException(
        this.i18n.t(`errors.PROFILE_EXISTED`, { lang: I18nContext.current().lang }),
      );
    }
    return false;
  }

  private async authorizeResource(
    userId: number,
    childProfileId: number,
  ): Promise<ReturnPlayerProfileDto> {
    //get childProfile
    let childProfile = await this.playerProfileRepository.getOneById(childProfileId);

    if (!childProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }
    let childId = childProfile.userId;

    //get current user childs
    // console.log({ userId });

    let childsIds = await this.userRepository.getChildsIds(userId);
    // console.log({ childsIds });

    childId = childId;

    // check if the child is the current user's child
    if (!childsIds.includes(childId)) {
      throw new ForbiddenException(
        this.i18n.t(`errors.NOT_ALLOWED`, { lang: I18nContext.current().lang }),
      );
    }
    return childProfile;
  }
}
