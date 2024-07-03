import { ApiProperty } from '@nestjs/swagger';

export class SocialMediaReturnDto {
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  profilePicture: string;
}
