import { ApiProperty } from '@nestjs/swagger';

export class SportWithImageDto {
  @ApiProperty()
  id: Number;

  @ApiProperty()
  name: String;

  @ApiProperty()
  profileImage: String;
}
