import Joi from 'joi';

export const PackageIdValidation = Joi.object({
  packageId: Joi.number().required(),
});
