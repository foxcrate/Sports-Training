import { AvailableDayDTO } from 'src/global/dtos/available-day.dto';
import { FieldAcceptanceStatusDto } from './field-acceptance-status.dto';

interface AvaiableDayHour {
  from: string;
  to: string;
}

interface FieldBookedHours {
  id: number;
  fromDateTime: string;
  userId: number;
}

export class FieldBookingDetailsDTO {
  id: number;
  name: string;
  profileImage: string;
  description: string;
  ratingNumber: string;
  cost: number;
  acceptanceStatus: FieldAcceptanceStatusDto;
  availableWeekDays: string[];
  availableDayHours: AvaiableDayHour;
  fieldBookedHours: FieldBookedHours[];
  fieldNotAvailableDays: AvailableDayDTO[];
}
