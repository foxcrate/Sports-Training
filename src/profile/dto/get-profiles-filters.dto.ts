import { PROFILE_TYPES_ENUM } from 'src/global/enums';

export interface GetProfilesFiltersDto {
  type: PROFILE_TYPES_ENUM;
  childId: string;
}
