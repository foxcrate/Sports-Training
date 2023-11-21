import * as Joi from 'joi';

export const AddTrainerProfileValidation = Joi.object({
  level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  ageGroup: Joi.string().valid('kids', 'young_adults', 'adults'),
  sessionDescription: Joi.string(),
  regionId: Joi.number(),
  sports: Joi.array().items(Joi.number()),
  fields: Joi.array().items(Joi.number()),
});
