import * as Joi from 'joi';

export const AccessTokenValidation = Joi.object({
  accessToken: Joi.string().required(),
});
