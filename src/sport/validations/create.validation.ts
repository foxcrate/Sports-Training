import * as Joi from 'joi';

export const AddSportValidation = Joi.object({
  enName: Joi.string().required(),
  arName: Joi.string().required(),
});
