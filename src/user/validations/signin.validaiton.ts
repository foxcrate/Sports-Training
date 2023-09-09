import * as Joi from 'joi';

export const SigninValidation = Joi.object({
  mobileNumber: Joi.string().required(),
  password: Joi.string().required(),
});
