import Joi from 'joi';
import ERROR_CODES from '../../constants/errorCodes.constant.js';

const updateProfileValidator = Joi.object({
  body: Joi.object({
    firstName: Joi.string().trim().min(3).max(20).required().messages({
      'any.required': ERROR_CODES.FIRSTNAME_REQUIRED,
      'string.empty': ERROR_CODES.FIRSTNAME_REQUIRED,
      'string.min': ERROR_CODES.FIRSTNAME_TOO_SHORT,
      'string.max': ERROR_CODES.FIRSTNAME_TOO_LONG,
    }),

    lastName: Joi.string().trim().min(3).max(20).required().messages({
      'any.required': ERROR_CODES.LASTNAME_REQUIRED,
      'string.empty': ERROR_CODES.LASTNAME_REQUIRED,
      'string.min': ERROR_CODES.LASTNAME_TOO_SHORT,
      'string.max': ERROR_CODES.LASTNAME_TOO_LONG,
    }),
  }),
});

export default updateProfileValidator;
