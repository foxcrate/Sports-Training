import Joi from 'joi';

export const AddRegionValidation = Joi.object({
  name_en: Joi.string().required(),
  name_ar: Joi.string().required(),
});
