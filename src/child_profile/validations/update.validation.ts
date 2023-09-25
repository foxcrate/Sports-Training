import * as Joi from 'joi';

export const UpdateChildProfileValidation = Joi.object({
  level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  regionId: Joi.number(),
  childProfileId: Joi.number(),
  sports: Joi.array().items(Joi.number()),
});
