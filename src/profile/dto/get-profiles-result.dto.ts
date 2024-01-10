import { PROFILE_TYPES_ENUM } from 'src/global/enums';

export type GetProfileResult = {
  childId: number | null;
  trainerProfileId: number | null;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  type: PROFILE_TYPES_ENUM;
};

export type GetProfilesResultDto = GetProfileResult[];
