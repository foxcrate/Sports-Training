import { PictureDTO } from 'src/global/dtos/picture.dto';
import { DoctorClinicAcceptanceStatusDto } from './doctor-clinic-acceptance-status.dto';
import { AvailableDayDTO } from 'src/global/dtos/available-day.dto';
import { ApiProperty } from '@nestjs/swagger';

class AvaiableDayHour {
  from: string;
  to: string;
}

class DoctorClinicBookedHours {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fromDateTime: string;

  @ApiProperty()
  userId: number;
}

export class DoctorClinicBookingDetailsDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  cost: number;

  @ApiProperty({
    type: String,
    enum: DoctorClinicAcceptanceStatusDto,
  })
  acceptanceStatus: DoctorClinicAcceptanceStatusDto;

  @ApiProperty({
    isArray: true,
    type: String,
  })
  availableWeekDays: string[];

  @ApiProperty({
    type: AvaiableDayHour,
  })
  availableDayHours: AvaiableDayHour;

  @ApiProperty({
    isArray: true,
    type: DoctorClinicBookedHours,
  })
  doctorClinicBookedHours: DoctorClinicBookedHours[];

  @ApiProperty({
    isArray: true,
    type: AvailableDayDTO,
  })
  doctorClinicNotAvailableDays: AvailableDayDTO[];

  @ApiProperty({
    isArray: true,
    type: PictureDTO,
  })
  gallery: PictureDTO[];
}
