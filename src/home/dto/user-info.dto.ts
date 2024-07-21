import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty()
  id: Number;

  @ApiProperty()
  firstName: String;

  @ApiProperty()
  lastName: String;

  @ApiProperty()
  profileImage: String;

  @ApiProperty()
  mobileNumber: String;
}
