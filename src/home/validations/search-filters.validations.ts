import Joi from 'joi';
import { HOME_SEARCH_TYPES_ENUM, RATES_ENUM } from 'src/global/enums';

export const SearchFiltersValidation = Joi.object({
  type: Joi.string()
    .required()
    .valid(...Object.values(HOME_SEARCH_TYPES_ENUM)),
  page: Joi.number().optional().integer().positive(),
  pageSize: Joi.number().optional().integer().positive(),
  offset: Joi.number().optional().integer(),
  limit: Joi.number().optional().integer().positive(),
  area: Joi.number().optional().integer().positive().allow(null),
  sport: Joi.number().optional().integer().positive().allow(null),
  rate: Joi.string()
    .optional()
    .valid(...Object.keys(RATES_ENUM))
    .allow(null),
  specialization: Joi.number().optional().integer().positive().allow(null),
  name: Joi.string().optional().allow(null),
});
