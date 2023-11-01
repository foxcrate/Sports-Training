import DateExtension from '@joi/date';
import * as JoiImport from 'joi';
const Joi = JoiImport.extend(DateExtension);

export const NotAvailableDatesValidation = Joi.object({
  notAvailableDays: Joi.array().items(Joi.date().format('YYYY-MM-DD')).required(),
});
