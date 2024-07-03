import { ApiProperty } from '@nestjs/swagger';

export class SessionUserDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lasttName: string;

  @ApiProperty()
  profileImage: string;
}
