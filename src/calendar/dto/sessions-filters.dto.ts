import { SESSIONS_STATUSES_ENUM } from 'src/global/enums';
import { CALENDAR_TYPES_ENUM } from './calendar-types.enum';

export type DatesCountTypeFilter = CALENDAR_TYPES_ENUM;

export interface SessionsFiltersDto {
  type: string;
  date: string;
  status?: SESSIONS_STATUSES_ENUM | undefined;
  pageSize?: string;
  fieldId?: number;
}
