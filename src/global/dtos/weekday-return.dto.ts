import { ApiProperty } from '@nestjs/swagger';

export class WeekDayReturnDto {
  @ApiProperty()
  dayNumber: number;
  @ApiProperty()
  dayName: string;
}
