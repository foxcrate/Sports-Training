import { ApiProperty } from '@nestjs/swagger';
import { PROFILE_TYPES_ENUM } from 'src/global/enums';

export class GetProfilesFiltersDto {
  type: PROFILE_TYPES_ENUM;

  childId: string;
}
