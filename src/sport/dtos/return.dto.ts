import { ApiProperty } from '@nestjs/swagger';

export class ReturnSportDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: String;

  @ApiProperty()
  profileImage: String;
}
