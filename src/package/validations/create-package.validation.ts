import Joi from 'joi';

export const CreatePackageValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  numberOfSessions: Joi.number().required(),
  minAttendees: Joi.number().required(),
  maxAttendees: Joi.number().max(15).required(),
  price: Joi.number().required(),
  ExpirationDate: Joi.string().required(),
  fieldId: Joi.number().required(),
  sessionsDateTime: Joi.array()
    .items({
      fromDateTime: Joi.string().required(),
      toDateTime: Joi.string().required(),
    })
    .required()
    .min(1),
});
