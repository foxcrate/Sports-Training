import Joi from 'joi';

export const DoctorClinicIdValidation = Joi.object({
  id: Joi.number().required(),
});
