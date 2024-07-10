import Joi from 'joi';

export const RegionIdValidation = Joi.object({
  regionId: Joi.number().required(),
});
