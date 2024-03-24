import Joi from 'joi';
import { PROFILE_TYPES_ENUM } from 'src/global/enums';

const childIdSchema = Joi.string()
  .required()
  .custom((value, helpers) => {
    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue) || parsedValue <= 0) {
      return helpers.error('any.invalid');
    }

    return parsedValue;
  }, 'custom child id validation');

export const GetProfilesValidations = Joi.object({
  type: Joi.string()
    .required()
    .valid(...Object.values(PROFILE_TYPES_ENUM)),
  childId: Joi.when('type', {
    is: PROFILE_TYPES_ENUM.CHILD,
    then: childIdSchema,
    otherwise: Joi.forbidden(),
  }),
});
