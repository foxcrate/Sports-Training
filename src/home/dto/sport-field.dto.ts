import { ApiProperty } from '@nestjs/swagger';

export class SportFieldDto {
  @ApiProperty()
  id: Number;

  @ApiProperty()
  name: String;

  @ApiProperty()
  profileImage: String;

  @ApiProperty()
  region: String;

  @ApiProperty()
  sportId: Number;

  @ApiProperty()
  sportName: String;
}
