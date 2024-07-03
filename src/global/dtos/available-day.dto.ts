import { ApiProperty } from '@nestjs/swagger';

export class AvailableDayDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  dayDate: string;
}
