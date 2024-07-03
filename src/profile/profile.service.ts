import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { PROFILE_TYPES_ENUM } from 'src/global/enums';
import { GlobalService } from 'src/global/global.service';
import { GetProfilesResultDto } from './dto/get-profiles-result.dto';

@Injectable()
export class ProfileService {
  constructor(
    private profileRepository: ProfileRepository,
    private globalService: GlobalService,
  ) {}

  private formatUserProfiles(userProfilesEntity): GetProfilesResultDto[] {
    const parsedChildren = userProfilesEntity?.children
      ? this.globalService.safeParse(userProfilesEntity?.children)
      : null;
    const parsedTrainerProfile = userProfilesEntity?.trainerProfile
      ? this.globalService.safeParse(userProfilesEntity?.trainerProfile)
      : null;
    const parsedPlayerProfile = userProfilesEntity?.playerProfile
      ? this.globalService.safeParse(userProfilesEntity?.playerProfile)
      : null;
    const result = [];
    if (Array.isArray(parsedChildren) && parsedChildren.length) {
      result.push(...parsedChildren);
    }
    if (parsedPlayerProfile) {
      result.push(parsedPlayerProfile);
    }
    if (parsedTrainerProfile) {
      result.push(parsedTrainerProfile);
    }
    return result;
  }

  async getProfiles(
    userId: number,
    type: PROFILE_TYPES_ENUM,
    childId: number,
  ): Promise<GetProfilesResultDto[]> {
    const result = await this.profileRepository.getUserProfiles(userId, type, childId);
    return this.formatUserProfiles(Array.isArray(result) ? result[0] : []);
  }
}
