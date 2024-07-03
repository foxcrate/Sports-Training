import { ApiProperty } from '@nestjs/swagger';
import { PROFILE_TYPES_ENUM } from 'src/global/enums';

export class GetProfilesResultDto {
  @ApiProperty()
  childId: number | null;

  @ApiProperty()
  trainerProfileId: number | null;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;

  @ApiProperty()
  profileImage: string | null;

  @ApiProperty()
  type: PROFILE_TYPES_ENUM;
}

// export type GetProfilesResultDto = GetProfileResult[];
