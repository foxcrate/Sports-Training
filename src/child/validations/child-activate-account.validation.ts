import * as Joi from 'joi';

export const ChildActivateAccountValidation = Joi.object({
  mobileNumber: Joi.string().required(),
  password: Joi.string().required(),
});
