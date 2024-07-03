import { ApiProperty } from '@nestjs/swagger';
import { HOME_SEARCH_TYPES_ENUM } from 'src/global/enums';

export class SearchFiltersDto {
  @ApiProperty({
    enum: HOME_SEARCH_TYPES_ENUM,
  })
  type:
    | HOME_SEARCH_TYPES_ENUM.COACHES
    | HOME_SEARCH_TYPES_ENUM.DOCTORS
    | HOME_SEARCH_TYPES_ENUM.FIELDS
    | HOME_SEARCH_TYPES_ENUM.ALL;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  area: string;

  @ApiProperty()
  sport?: string;

  @ApiProperty()
  rate: string;

  @ApiProperty()
  specialization?: number;

  @ApiProperty()
  name?: string;
}
