import { ApiProperty } from '@nestjs/swagger';

export class DatesCountResultDto {
  @ApiProperty()
  bookingDate: string;
  @ApiProperty()
  bookedHoursCount: number;
}
