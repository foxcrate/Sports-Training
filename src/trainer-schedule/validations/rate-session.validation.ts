import * as Joi from 'joi';

export const RateSessionValidation = Joi.object({
  sessionId: Joi.number().required(),
  ratingNumber: Joi.number().valid(1, 2, 3, 4, 5).required(),
  feedback: Joi.string(),
});
