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
      date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{1,2}$/)
        .message('Date must be in YYYY-MM-DD format')
        .required(),
      fromTime: Joi.string()
        .regex(/^([0-9]{2})\:([0-9]{2})( [AaPp][Mm])?$/)
        .message('Time must be in HH:mm format')
        .required(),
      toTime: Joi.string()
        .regex(/^([0-9]{2})\:([0-9]{2})( [AaPp][Mm])?$/)
        .message('Time must be in HH:mm format')
        .required(),
    })
    .required()
    .min(1),
});
