import DateExtension from '@joi/date';
import * as JoiImport from 'joi';
const Joi = JoiImport.extend(DateExtension);

export const DoctorClinicAvailableHoursValidation = Joi.object({
  id: Joi.number().required(),
  date: Joi.date().format('YYYY-MM-DD').required(),
});
