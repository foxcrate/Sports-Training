import { ApiProperty } from '@nestjs/swagger';

export class CreateSportDto {
  @ApiProperty()
  name_en: string;

  @ApiProperty()
  name_ar: string;
}
