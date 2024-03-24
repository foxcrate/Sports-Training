import Joi from 'joi';

export const PlayerProfileIdValidation = Joi.object({
  playerProfileId: Joi.number().required(),
});
