import { ApiProperty } from '@nestjs/swagger';
import { CALENDAR_TYPES_ENUM } from './calendar-types.enum';

export class DateSessionsResultDto {
  @ApiProperty()
  id: string | null;
  @ApiProperty()
  bookedHour: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  profileImage: string;
  @ApiProperty()
  region: string;
  @ApiProperty()
  sports: string[] | null;
  @ApiProperty()
  sport: string | null;
  @ApiProperty()
  specialization: string | null;
  @ApiProperty()
  startTime: string;
  @ApiProperty()
  sessionField: string | null;
  @ApiProperty()
  type: CALENDAR_TYPES_ENUM;
}

// export type DateSessionsResultDto = AllTypesResultDto[];
