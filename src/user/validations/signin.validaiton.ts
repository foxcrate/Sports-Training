import Joi from 'joi';

export const UserSigninValidation = Joi.object({
  mobileNumber: Joi.string().required(),
  password: Joi.string().required(),
});
