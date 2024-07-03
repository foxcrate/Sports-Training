import { ApiProperty } from '@nestjs/swagger';

export class SlotDetailsDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  fromTime: string;

  @ApiProperty()
  toTime: string;

  @ApiProperty()
  cost: number;

  @ApiProperty()
  weekDayNumber: number;

  @ApiProperty()
  weekDayName: string;

  @ApiProperty()
  fieldId: number;

  @ApiProperty()
  scheduleId: number;
}
