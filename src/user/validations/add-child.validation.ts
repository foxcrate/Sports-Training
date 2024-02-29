import * as Joi from 'joi';

export const AddChildValidation = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  profileImage: Joi.string(),
  email: Joi.string().email(),
  mobileNumber: Joi.string().required(),
  genderId: Joi.number().required(),
  birthday: Joi.date().iso().required(),
});
