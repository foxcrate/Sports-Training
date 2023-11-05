import * as Joi from 'joi';

export const AddRegionValidation = Joi.object({
  name: Joi.string().required(),
});
