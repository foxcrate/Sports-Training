interface AvaiableDayHour {
  from: string;
  to: string;
}

interface FieldBookedHours {
  id: number;
  fromDateTime: string;
  toDateTime: string;
  userId: number;
}

export class FieldBookingDetailsDTO {
  id: number;
  name: string;
  availableWeekDays: string[];
  availableDayHours: AvaiableDayHour;
  fieldBookedHours: FieldBookedHours[];
  fieldNotAvailableDays: string;
}
