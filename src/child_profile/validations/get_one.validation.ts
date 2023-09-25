import * as Joi from 'joi';

export const GetOneChildProfileValidation = Joi.object({
  childProfileId: Joi.number().required(),
});
