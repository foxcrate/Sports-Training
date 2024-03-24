import Joi from 'joi';

export const CreatePasswordValidation = Joi.object({
  password: Joi.string().required(),
});
