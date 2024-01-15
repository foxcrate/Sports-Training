import * as Joi from 'joi';

export const CoachCancelSessionValidations = Joi.object({
  cancelReasonId: Joi.number().required().positive(),
});
