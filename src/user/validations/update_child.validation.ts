import * as Joi from 'joi';

export const UpdateChildValidation = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  profileImage: Joi.string(),
  gender: Joi.string().valid('female', 'male').required(),
  birthday: Joi.date().iso().required(),
});
