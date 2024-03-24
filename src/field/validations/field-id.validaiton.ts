import Joi from 'joi';

export const FieldIdValidation = Joi.object({
  id: Joi.number().required(),
});
