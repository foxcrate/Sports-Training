import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty()
  token: string;

  // @ApiProperty()
  // otp: string;
}
