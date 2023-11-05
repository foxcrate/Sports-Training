import * as Joi from 'joi';

export const CompleteSignupValidation = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  // fcm_token: Joi.string(),
  profileImage: Joi.string(),
  email: Joi.string().email().required(),
  gender: Joi.string().valid('female', 'male').required(),
  birthday: Joi.date().iso().required(),
});
