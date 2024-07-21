import DateExtension from '@joi/date';
import { ApiProperty } from '@nestjs/swagger';
import * as JoiImport from 'joi';
const Joi = JoiImport.extend(DateExtension);

export const BookTrainerSessionValidation = Joi.object({
  childId: Joi.number().required(),
  trainerProfileId: Joi.number().required(),
  dayDate: Joi.date().format('YYYY-MM-DD').required(),
  slotId: Joi.number().required(),
});
