import { ApiProperty } from '@nestjs/swagger';

export class SigninUserDto {
  @ApiProperty()
  mobileNumber: string;
  @ApiProperty()
  password: string;
}
