import Joi from 'joi';

export const BookTrainerPackageValidation = Joi.object({
  trainerProfileId: Joi.number().required(),
  packageId: Joi.number().required(),
});
