import { ApiProperty } from '@nestjs/swagger';

export class RegionCreateDto {
  @ApiProperty()
  name_en: String;

  @ApiProperty()
  name_ar: String;
}
