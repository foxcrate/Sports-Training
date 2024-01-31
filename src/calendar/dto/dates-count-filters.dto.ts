import { CALENDAR_TYPES_ENUM } from './calendar-types.enum';

export type DatesCountTypeFilter = CALENDAR_TYPES_ENUM;

export interface DatesCountFiltersDto {
  type: DatesCountTypeFilter;
  startDate?: string;
}
