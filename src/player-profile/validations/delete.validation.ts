import Joi from 'joi';

export const DeletePlayerProfileValidation = Joi.object({
  playerProfileId: Joi.number().required(),
});
