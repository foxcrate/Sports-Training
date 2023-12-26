import DateExtension from '@joi/date';
import * as JoiImport from 'joi';
const Joi = JoiImport.extend(DateExtension);

export const UpdateDoctorClinicValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().min(10),
  cost: Joi.number().required(),
  slotDuration: Joi.number().min(30).required(),
  address: Joi.string().min(10).required(),
  longitude: Joi.number().required(),
  latitude: Joi.number().required(),
  profileImage: Joi.string(),
  regionId: Joi.number().required(),
  doctorClinicSpecializationId: Joi.number().required(),
  availableWeekDays: Joi.array()
    .items(
      Joi.string().valid(
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ),
    )
    .required(),
  startTime: Joi.string()
    .regex(/^([0-9]{2})\:([0-9]{2})( [AaPp][Mm])?$/)
    .required(),
  endTime: Joi.string()
    .regex(/^([0-9]{2})\:([0-9]{2})( [AaPp][Mm])?$/)
    .required(),
  // notAvailableDays: Joi.array().items(Joi.date().format('YYYY-MM-DD')).required(),
});
