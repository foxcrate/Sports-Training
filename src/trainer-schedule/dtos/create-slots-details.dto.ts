import { ApiProperty } from '@nestjs/swagger';

export class CreateSlotDetailsDto {
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
  fieldId: number;
}
