import * as Joi from 'joi';

export const AddRegionValidation = Joi.object({
  enName: Joi.string().required(),
  arName: Joi.string().required(),
});
