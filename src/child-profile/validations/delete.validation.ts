import Joi from 'joi';

export const DeleteChildProfileValidation = Joi.object({
  childProfileId: Joi.number().required(),
});
