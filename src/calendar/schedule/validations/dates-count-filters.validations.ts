import * as Joi from 'joi';
import { HOME_SEARCH_TYPES_ENUM } from 'src/utils/enums';

export const DatesCountFiltersValidation = Joi.object({
  type: Joi.string()
    .required()
    .valid(
      ...Object.values(HOME_SEARCH_TYPES_ENUM).filter(
        (type) => type !== HOME_SEARCH_TYPES_ENUM.ALL,
      ),
    ),
});
