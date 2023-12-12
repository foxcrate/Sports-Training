import * as Joi from 'joi';

export const UpdateUserValidation = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  profileImage: Joi.string(),
  birthday: Joi.date().iso().required(),
});
