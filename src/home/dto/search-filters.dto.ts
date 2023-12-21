import { HOME_SEARCH_TYPES_ENUM } from 'src/utils/enums';

export interface SearchFiltersDto {
  page: number;
  pageSize: number;
  type:
    | HOME_SEARCH_TYPES_ENUM.COACHES
    | HOME_SEARCH_TYPES_ENUM.DOCTORS
    | HOME_SEARCH_TYPES_ENUM.FIELDS;
  area: string;
  sports: string[];
  rate: string;
}
