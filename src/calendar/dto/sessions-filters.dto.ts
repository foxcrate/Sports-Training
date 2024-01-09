import { HOME_SEARCH_TYPES_ENUM } from 'src/global/enums';

export type DatesCountTypeFilter =
  | HOME_SEARCH_TYPES_ENUM.COACHES
  | HOME_SEARCH_TYPES_ENUM.DOCTORS
  | HOME_SEARCH_TYPES_ENUM.FIELDS;

export interface SessionsFiltersDto {
  type: string;
  date: string;
  pageSize?: string;
}
