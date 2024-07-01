import { ApiProperty } from '@nestjs/swagger';

export class ReturnUserDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  isActivated: boolean;
  @ApiProperty()
  profileImage: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  mobileNumber: string;
  @ApiProperty()
  genderId: number;
  @ApiProperty()
  birthday: Date;
  @ApiProperty()
  createdAt: Date;
}
