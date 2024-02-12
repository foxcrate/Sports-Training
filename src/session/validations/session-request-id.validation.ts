import * as Joi from 'joi';

export const SessionRequestIdValidations = Joi.object({
  sessionRequestId: Joi.number().required(),
});
