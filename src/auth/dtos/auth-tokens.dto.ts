import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDTO {
  @ApiProperty()
  token: string;
  @ApiProperty()
  refreshToken: string;
}
