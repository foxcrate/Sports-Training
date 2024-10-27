import { ApiProperty } from '@nestjs/swagger';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';

export class SignupUserDto {
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  profileImage: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  mobileNumber: string;
  @ApiProperty()
  genderId: number;
  @ApiProperty()
  birthday: Date;

  userType: AvailableRoles;
}
