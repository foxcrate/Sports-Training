import { ApiProperty } from '@nestjs/swagger';

export class updateDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  //   @ApiProperty()
  //   email: string;

  @ApiProperty()
  profileImage: string;

  @ApiProperty()
  birthday: string;
}
