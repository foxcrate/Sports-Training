import Joi from 'joi';

export const AddScheduleValidation = Joi.object({
  slots: Joi.array()
    .items({
      name: Joi.string(),
      fromTime: Joi.string()
        .regex(/^([0-9]{2})\:([0-9]{2})( [AaPp][Mm])?$/)
        .required(),
      toTime: Joi.string()
        .regex(/^([0-9]{2})\:([0-9]{2})( [AaPp][Mm])?$/)
        .required(),
      cost: Joi.number(),
      weekDayNumber: Joi.number().valid(0, 1, 2, 3, 4, 5, 6).required(),
      fieldId: Joi.number().required(),
    })
    .required()
    .min(1),
  months: Joi.array()
    .items(Joi.number().valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12))
    .required()
    .min(1),
});
