export type DoctorResultDto = {
  doctorBookedHoursId: string;
  bookedHour: string;
  name: string;
  profileImage: string;
  region: string;
  specialization: string;
};

export type FieldResultDto = {
  fieldBookedHoursId: string;
  bookedHour: string;
  name: string;
  profileImage: string;
  region: string;
  sport: string;
};

export type CoachResultDto = {
  coachBookedHoursId: string;
  bookedHour: string;
  name: string;
  profileImage: string;
  region: string;
  sports: string[];
};

export type DateSessionsResultDto =
  | CoachResultDto[]
  | DoctorResultDto[]
  | FieldResultDto[];
