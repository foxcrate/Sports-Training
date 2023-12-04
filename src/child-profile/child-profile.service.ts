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
import { PlayerProfileModel } from '../player-profile/player-profile.model';
import { UserModel } from 'src/user/user.model';

@Injectable()
export class ChildProfileService {
  constructor(
    private userModel: UserModel,
    private playerProfileModel: PlayerProfileModel,
    private readonly i18n: I18nService,
  ) {}

  async create(
    createData: PlayerProfileCreateDto,
    childId,
    userId,
  ): Promise<ReturnPlayerProfileDto> {
    let child = await this.userModel.getById(childId);

    if (!(await this.userModel.isMyChild(userId, child.id))) {
      throw new ForbiddenException(
        this.i18n.t(`errors.UNAUTHORIZED`, { lang: I18nContext.current().lang }),
      );
    }

    await this.findRepeated(childId);

    await this.playerProfileModel.create(createData, childId);

    return await this.playerProfileModel.getOneDetailedByUserId(childId);
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

    await this.playerProfileModel.updateById(createData, childProfile.id);
    return await this.playerProfileModel.getOneDetailedByUserId(childProfile.userId);
  }

  async delete(userId, childProfileId): Promise<ReturnPlayerProfileDto> {
    // return the childProfile or throw unauthorized error
    await this.authorizeResource(userId, childProfileId);

    let deletedChildProfile: ReturnPlayerProfileDto =
      await this.playerProfileModel.getOneById(childProfileId);

    await this.playerProfileModel.deleteById(deletedChildProfile.id);

    return deletedChildProfile;
  }

  async getAll(userId): Promise<ReturnPlayerProfileWithUserAndSportsDto[]> {
    //get all user's childs
    let childsIds = await this.userModel.getChildsIds(userId);

    //return empty array if childsIds is empty
    if (childsIds.length == 0) {
      return [];
    }

    return await this.playerProfileModel.getManyByUserIds(childsIds);
  }

  async getOne(userId, childProfileId): Promise<ReturnPlayerProfileWithUserAndSportsDto> {
    // return the childProfile or throw unauthorized error
    let childProfile = await this.authorizeResource(userId, childProfileId);

    //get childProfile

    return await this.playerProfileModel.getOneDetailedById(childProfile.id);
  }

  private async findRepeated(childId): Promise<boolean> {
    let repeatedChildProfile = await this.playerProfileModel.getOneByUserId(childId);

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
    let childProfile = await this.playerProfileModel.getOneById(childProfileId);

    if (!childProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }
    let childId = childProfile.userId;

    //get current user childs
    // console.log({ userId });

    let childsIds = await this.userModel.getChildsIds(userId);
    // console.log({ childsIds });

    childId = childId;

    // check if the child is the current user's child
    if (!childsIds.includes(childId)) {
      throw new ForbiddenException(
        this.i18n.t(`errors.UNAUTHORIZED`, { lang: I18nContext.current().lang }),
      );
    }
    return childProfile;
  }
}
