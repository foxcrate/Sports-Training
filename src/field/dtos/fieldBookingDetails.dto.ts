import { AvailableDayDTO } from 'src/global/dtos/available-day.dto';
import { FieldAcceptanceStatusDto } from './field-acceptance-status.dto';
import { ApiProperty } from '@nestjs/swagger';

class AvaiableDayHour {
  from: string;
  to: string;
}

class FieldBookedHours {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fromDateTime: string;

  @ApiProperty()
  userId: number;
}

export class FieldBookingDetailsDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  profileImage: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  ratingNumber: string;

  @ApiProperty()
  cost: number;

  @ApiProperty({
    enum: FieldAcceptanceStatusDto,
  })
  acceptanceStatus: FieldAcceptanceStatusDto;

  @ApiProperty({ isArray: true, type: String })
  availableWeekDays: string[];

  @ApiProperty({
    type: AvaiableDayHour,
  })
  availableDayHours: AvaiableDayHour;

  @ApiProperty({
    isArray: true,
    type: FieldBookedHours,
  })
  fieldBookedHours: FieldBookedHours[];

  @ApiProperty({
    type: AvailableDayDTO,
    isArray: true,
  })
  fieldNotAvailableDays: AvailableDayDTO[];
}
