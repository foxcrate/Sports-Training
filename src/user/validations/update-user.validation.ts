import Joi from 'joi';

export const UpdateUserValidation = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  profileImage: Joi.string(),
  birthday: Joi.date().iso(),
  email: Joi.string().email(),
});
