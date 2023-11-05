import * as Joi from 'joi';

export const AddSportValidation = Joi.object({
  name: Joi.string().required(),
});
