import * as Joi from 'joi';

export const AddTrainerProfileValidation = Joi.object({
  levelId: Joi.number(),
  ageGroupId: Joi.number(),
  sessionDescription: Joi.string(),
  cost: Joi.number(),
  hoursPriorToBooking: Joi.number(),
  regionId: Joi.number(),
  sports: Joi.array().items(Joi.number()),
  fields: Joi.array().items(Joi.number()),
  images: Joi.array().items(Joi.string()),
  certificates: Joi.array().items({
    name: Joi.string().required(),
    imageLink: Joi.string().required(),
  }),
});
