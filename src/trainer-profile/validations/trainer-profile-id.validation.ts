import * as Joi from 'joi';

export const TrainerProfileIdValidation = Joi.object({
  trainerProfileId: Joi.number().required(),
});
