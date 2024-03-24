import Joi from 'joi';

export const ScheduleIdValidation = Joi.object({
  id: Joi.number().required(),
});
