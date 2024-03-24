import Joi from 'joi';

export const UpdatePlayerProfileParamsValidation = Joi.object({
  playerProfileId: Joi.number().required(),
});
