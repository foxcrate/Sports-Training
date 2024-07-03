import { ApiProperty } from '@nestjs/swagger';

export class ReserveSlotDto {
  @ApiProperty()
  dayDate: string;
  @ApiProperty({ isArray: true, type: String })
  dayTimes: string[];
}
