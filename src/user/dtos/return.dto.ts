import { ApiProperty } from '@nestjs/swagger';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';

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
  email: string;
  @ApiProperty()
  mobileNumber: string;
  @ApiProperty()
  genderId: number;
  @ApiProperty()
  profileImage: string;
  @ApiProperty()
  birthday: Date;
  @ApiProperty()
  createdAt: Date;

  password?: string;
  userType?: AvailableRoles;
  isPhoneVerified?: Boolean;
}
