import * as Joi from 'joi';

export const SignupValidation = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  profileImage: Joi.string(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  mobileNumber: Joi.string().required(),
  gender: Joi.string().valid('female', 'male').required(),
  birthday: Joi.date().iso().required(),
});
