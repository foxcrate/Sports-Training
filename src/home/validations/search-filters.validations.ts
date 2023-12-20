import * as Joi from 'joi';
import { HOME_SEARCH_TYPES_ENUM, RATES_ENUM } from 'src/utils/enums';

const customSportsTransform = (value: string) => {
  const transformedArray = value.split(',').map(String);

  return transformedArray;
};

export const SearchFiltersValidation = Joi.object({
  type: Joi.string()
    .required()
    .valid(...Object.values(HOME_SEARCH_TYPES_ENUM)),
  page: Joi.string().optional(),
  pageSize: Joi.string().optional(),
  area: Joi.string().optional().max(255),
  sports: Joi.string().optional().custom(customSportsTransform),
  rate: Joi.string()
    .optional()
    .valid(...Object.keys(RATES_ENUM)),
});
