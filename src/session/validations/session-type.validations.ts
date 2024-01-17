import * as Joi from 'joi';
import { HOME_SEARCH_TYPES_ENUM } from 'src/global/enums';

export const SessionTypeValidations = Joi.object({
  type: Joi.string()
    .required()
    .valid(
      ...Object.values(HOME_SEARCH_TYPES_ENUM).filter(
        (type) => type !== HOME_SEARCH_TYPES_ENUM.ALL,
      ),
    ),
});
