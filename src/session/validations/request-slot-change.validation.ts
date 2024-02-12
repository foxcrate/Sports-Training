import DateExtension from '@joi/date';
import * as JoiImport from 'joi';
const Joi = JoiImport.extend(DateExtension);

export const RequestSlotChangeValidation = Joi.object({
    sessionId: Joi.number().required(),
    newSlotId: Joi.number().required(),
    newDate: Joi.date().format('YYYY-MM-DD').required(),
});
