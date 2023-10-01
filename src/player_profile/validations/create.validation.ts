import * as Joi from 'joi';

export const AddPlayerProfileValidation = Joi.object({
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  regionId: Joi.number(),
  sports: Joi.array().items(Joi.number()),
});
