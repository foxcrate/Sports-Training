import * as Joi from 'joi';

export const ChildSigninValidation = Joi.object({
  mobileNumber: Joi.string().required(),
  password: Joi.string().required(),
});
