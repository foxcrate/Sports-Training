import * as Joi from 'joi';

export const AddDoctorClinicSpecializationValidation = Joi.object({
  name: Joi.string().required(),
});
