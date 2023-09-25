import * as Joi from 'joi';

export const UpdateChildProfileParamsValidation = Joi.object({
  childProfileId: Joi.number().required(),
});
