import * as Joi from 'joi';

export const ImageFileValidation = Joi.object({
  imageFile: Joi.string().required(),
});
