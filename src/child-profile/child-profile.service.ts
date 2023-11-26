import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChildProfileCreateDto } from './dtos/create.dto';
import { ReturnChildProfileDto } from './dtos/return.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ReturnChildProfileWithChildAndSportsDto } from './dtos/return-with-child-and-sports.dto';
import { ChildProfileModel } from './child-profile.model';
import { ChildService } from 'src/child/child.service';
import { UserModel } from 'src/user/user.model';

@Injectable()
export class ChildProfileService {
  constructor(
    private userModel: UserModel,
    private childService: ChildService,
    private childProfileModel: ChildProfileModel,
    private readonly i18n: I18nService,
  ) {}

  async create(
    createData: ChildProfileCreateDto,
    childId,
    userId,
  ): Promise<ReturnChildProfileWithChildAndSportsDto> {
    //throw an error if child not exist
    let child = await this.childService.getChildById(childId);
    if (child.userId != userId) {
      throw new ForbiddenException(
        this.i18n.t(`errors.UNAUTHORIZED`, { lang: I18nContext.current().lang }),
      );
    }
    //throw an error if repeated
    await this.findRepeated(childId);

    let newChildProfileWithSports = this.childProfileModel.create(createData, childId);
    return newChildProfileWithSports;
  }

  async update(
    createData: ChildProfileCreateDto,
    childProfileId,
    userId,
  ): Promise<ReturnChildProfileWithChildAndSportsDto> {
    //check profile existance
    let childProfile = await this.authorizeResource(userId, childProfileId);

    if (!childProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }

    return await this.childProfileModel.updateById(createData, childProfileId);
  }

  async delete(userId, childProfileId): Promise<ReturnChildProfileDto> {
    // return the childProfile or throw unauthorized error
    await this.authorizeResource(userId, childProfileId);

    let deletedChildProfile: ReturnChildProfileDto =
      await this.childProfileModel.getOneById(childProfileId);

    await this.childProfileModel.deleteById(deletedChildProfile.id);

    return deletedChildProfile;
  }

  async getAll(userId): Promise<ReturnChildProfileWithChildAndSportsDto[]> {
    //get all user's childs
    let childsIds = await this.userModel.getUserChildsIds(userId);

    //return empty array if childsIds is empty
    if (childsIds.length == 0) {
      return [];
    }

    return await this.childProfileModel.getManyByChildIds(childsIds);
  }

  async getOne(userId, childProfileId): Promise<ReturnChildProfileWithChildAndSportsDto> {
    // return the childProfile or throw unauthorized error
    let childProfile = await this.authorizeResource(userId, childProfileId);

    //get childProfile

    return await this.childProfileModel.getOneDetailedById(childProfile.id);
  }

  private async findRepeated(childId): Promise<Boolean> {
    let repeatedChildProfile = await this.childProfileModel.getOneByChildId(childId);

    if (repeatedChildProfile[0]) {
      throw new BadRequestException(
        this.i18n.t(`errors.PROFILE_EXISTED`, { lang: I18nContext.current().lang }),
      );
    }
    return false;
  }

  private async authorizeResource(
    userId: number,
    childProfileId: number,
  ): Promise<ReturnChildProfileDto> {
    //get childProfile
    let childProfile = await this.childProfileModel.getOneById(childProfileId);
    if (!childProfile) {
      throw new NotFoundException(
        this.i18n.t(`errors.RECORD_NOT_FOUND`, { lang: I18nContext.current().lang }),
      );
    }
    let childId = childProfile.childId;

    //get current user childs
    // console.log({ userId });

    let childsIds = await this.userModel.getUserChildsIds(userId);
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
