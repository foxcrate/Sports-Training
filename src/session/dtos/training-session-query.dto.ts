import { HOME_SEARCH_TYPES_ENUM } from 'src/global/enums';

export interface TrainingSessionQueryDto {
  type:
    | HOME_SEARCH_TYPES_ENUM.COACHES
    | HOME_SEARCH_TYPES_ENUM.DOCTORS
    | HOME_SEARCH_TYPES_ENUM.FIELDS;
}
