import DateExtension from '@joi/date';
import * as JoiImport from 'joi';
const Joi = JoiImport.extend(DateExtension);

export const ReserveSlotValidation = Joi.object({
  dayDate: Joi.date().format('YYYY-MM-DD').required(),
  dayTimes: Joi.array()
    .items(
      Joi.string()
        .regex(/^([0-9]{2})\:([0-9]{2})( [AaPp][Mm])?$/)
        .required(),
    )
    .required(),
});
