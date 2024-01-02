import { HOME_SEARCH_TYPES_ENUM } from 'src/global/enums';

export interface SearchFiltersDto {
  page: number;
  offset: number;
  limit: number;
  pageSize: number;
  type:
    | HOME_SEARCH_TYPES_ENUM.COACHES
    | HOME_SEARCH_TYPES_ENUM.DOCTORS
    | HOME_SEARCH_TYPES_ENUM.FIELDS
    | HOME_SEARCH_TYPES_ENUM.ALL;
  area: string;
  sport?: string;
  rate: string;
  specialization?: number;
  name?: string;
}
