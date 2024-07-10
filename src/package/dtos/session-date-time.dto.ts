import { ApiProperty } from '@nestjs/swagger';

export class SessionDateTimeDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  fromTime: string;

  @ApiProperty()
  toTime: string;
}
