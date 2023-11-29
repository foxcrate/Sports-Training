import * as Joi from 'joi';

export const GetOnePlayerProfileValidation = Joi.object({
  playerProfileId: Joi.number().required(),
});
