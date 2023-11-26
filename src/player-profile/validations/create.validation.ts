import * as Joi from 'joi';

export const AddPlayerProfileValidation = Joi.object({
  level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  regionId: Joi.number(),
  sports: Joi.array().items(Joi.number()),
});
