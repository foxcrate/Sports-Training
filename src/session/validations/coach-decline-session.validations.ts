import * as Joi from 'joi';

export const CoachDeclineSessionValidations = Joi.object({
  declineReasonId: Joi.number().required().positive(),
});
