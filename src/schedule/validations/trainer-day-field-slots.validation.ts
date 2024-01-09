import DateExtension from '@joi/date';
import * as JoiImport from 'joi';
const Joi = JoiImport.extend(DateExtension);

export const TrainerDayFieldSlotsValidation = Joi.object({
  trainerProfileId: Joi.number().required(),
  fieldId: Joi.number().required(),
  dayDate: Joi.date().format('YYYY-MM-DD').required(),
});
