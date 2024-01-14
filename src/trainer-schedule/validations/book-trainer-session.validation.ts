import DateExtension from '@joi/date';
import * as JoiImport from 'joi';
const Joi = JoiImport.extend(DateExtension);

export const BookTrainerSessionValidation = Joi.object({
  trainerProfileId: Joi.number().required(),
  dayDate: Joi.date().format('YYYY-MM-DD').required(),
  slotId: Joi.number().required(),
});
