import * as Joi from 'joi';

export const SignupByMobileValidation = Joi.object({
  mobileNumber: Joi.string().required(),
  password: Joi.string().required(),
});
