import * as Joi from 'joi';

export const SignupSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  mobileNumber: Joi.string().required(),
  gender: Joi.string().valid('female', 'male', 'unknown').required(),
  birthday: Joi.date().iso().required(),
});
