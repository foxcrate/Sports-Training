import Joi from 'joi';

export const AddPlayerProfileValidation = Joi.object({
  levelId: Joi.number(),
  regionId: Joi.number(),
  sports: Joi.array().items(Joi.number()),
});
