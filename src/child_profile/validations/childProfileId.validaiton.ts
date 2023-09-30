import * as Joi from 'joi';

export const ChildProfileIdValidation = Joi.object({
  childProfileId: Joi.number().required(),
});
