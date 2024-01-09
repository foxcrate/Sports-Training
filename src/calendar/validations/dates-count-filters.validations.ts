import * as Joi from 'joi';

export const DatesCountFiltersValidation = Joi.object({
  startDate: Joi.string().isoDate().optional(),
});
