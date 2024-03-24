import Joi from 'joi';

export const LanguageValidation = Joi.object({
  language: Joi.string().valid('en', 'ar'),
});
