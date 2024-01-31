import * as Joi from 'joi';
import { CALENDAR_TYPES_ENUM } from '../dto/calendar-types.enum';
import { SESSIONS_STATUSES_ENUM } from 'src/global/enums';

const typeSchema = Joi.string()
  .optional()
  .default('')
  .custom((value, helpers) => {
    const types = value.split(',').map((type) => type.trim());
    const allowedTypes = Object.values(CALENDAR_TYPES_ENUM);

    const isValid = types.every((type) => allowedTypes.includes(type));

    if (!isValid) {
      return helpers.error('any.invalid');
    }

    return value;
  }, 'custom type validation');

const pageSizeSchema = Joi.string()
  .optional()
  .custom((value, helpers) => {
    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue) || parsedValue <= 0) {
      return helpers.error('any.invalid');
    }

    return parsedValue;
  }, 'custom page size validation');

export const SessionsFiltersValidation = Joi.object({
  type: typeSchema,
  date: Joi.string().isoDate().optional(),
  status: Joi.string()
    .optional()
    .valid(...Object.values(SESSIONS_STATUSES_ENUM)),
  pageSize: pageSizeSchema,
  fieldId: Joi.number().optional().positive(),
});
