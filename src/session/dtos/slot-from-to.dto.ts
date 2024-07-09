import { ApiProperty } from '@nestjs/swagger';

export class IdFromToTimeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fromTime: string;

  @ApiProperty()
  toTime: string;
}
