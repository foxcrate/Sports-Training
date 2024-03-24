import Joi from 'joi';

export const SendOTPValidation = Joi.object({
  mobileNumber: Joi.string().required(),
});
