import { PictureDTO } from 'src/global/dtos/picture.dto';
import { DoctorClinicAcceptanceStatusDto } from './doctor-clinic-acceptance-status.dto';
import { AvailableDayDTO } from 'src/global/dtos/available-day.dto';

interface AvaiableDayHour {
  from: string;
  to: string;
}

interface DoctorClinicBookedHours {
  id: number;
  fromDateTime: string;
  userId: number;
}

export class DoctorClinicBookingDetailsDTO {
  id: number;
  name: string;
  acceptanceStatus: DoctorClinicAcceptanceStatusDto;
  availableWeekDays: string[];
  availableDayHours: AvaiableDayHour;
  doctorClinicBookedHours: DoctorClinicBookedHours[];
  doctorClinicNotAvailableDays: AvailableDayDTO[];
  gallery: PictureDTO[];
}
