import Joi from 'joi';

export const VerifyOtpValidation = Joi.object({
  token: Joi.string().required(),
});
