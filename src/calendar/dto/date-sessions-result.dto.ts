export type AllTypesResultDto = {
  coachBookedHoursId: string | null;
  doctorBookedHoursId: string | null;
  fieldBookedHoursId: string | null;
  bookedHour: string;
  name: string;
  profileImage: string;
  region: string;
  sports: string[] | null;
  sport: string | null;
  specialization: string | null;
  startTime: string;
};

export type DateSessionsResultDto = AllTypesResultDto[];
