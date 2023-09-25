import * as Joi from 'joi';

export const AddChildProfileValidation = Joi.object({
  level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  regionId: Joi.number(),
  childId: Joi.number().required(),
  sports: Joi.array().items(Joi.number()),
});
