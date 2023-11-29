import * as Joi from 'joi';

export const ChildIdValidation = Joi.object({
  childId: Joi.number().required(),
});
