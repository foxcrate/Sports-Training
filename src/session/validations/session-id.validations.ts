import * as Joi from 'joi';

export const SessionIdParamValidations = Joi.object({
  sessionId: Joi.number().required(),
});
