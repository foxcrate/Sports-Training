import * as Joi from 'joi';

export const FieldSlotsValidation = Joi.object({
  trainerProfileId: Joi.number().required(),
  fieldId: Joi.number().required(),
});
