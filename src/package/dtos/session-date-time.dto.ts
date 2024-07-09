import { ApiProperty } from '@nestjs/swagger';

export class SessionDateTimeDto {
  @ApiProperty()
  fromDateTime: string;

  @ApiProperty()
  toDateTime: string;
}
