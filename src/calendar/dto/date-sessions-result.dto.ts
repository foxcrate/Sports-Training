import { CALENDAR_TYPES_ENUM } from './calendar-types.enum';

export type AllTypesResultDto = {
  id: string | null;
  bookedHour: string;
  name: string;
  profileImage: string;
  region: string;
  sports: string[] | null;
  sport: string | null;
  specialization: string | null;
  startTime: string;
  sessionField: string | null;
  type: CALENDAR_TYPES_ENUM;
};

export type DateSessionsResultDto = AllTypesResultDto[];
