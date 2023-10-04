import * as Joi from 'joi';

export const GetOneChildValidation = Joi.object({
  childId: Joi.number().required(),
});
