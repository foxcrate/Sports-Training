import Joi from 'joi';

export const PackageIdValidation = Joi.object({
  id: Joi.number().required(),
});
