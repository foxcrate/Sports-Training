import Joi from 'joi';

export const VerifyOtpValidation = Joi.object({
  mobileNumber: Joi.string().required(),
  otp: Joi.string().required(),
});
