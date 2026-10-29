import Joi from 'joi';
import ERROR_CODES from '../../constants/errorCodes.constant.js';

const deleteAccountValidator = Joi.object({
  body: Joi.object({
    password: Joi.string().min(8).required().messages({
      'any.required': ERROR_CODES.PASSWORD_REQUIRED,
      'string.empty': ERROR_CODES.PASSWORD_REQUIRED,
      'string.min': ERROR_CODES.PASSWORD_TOO_SHORT,
    }),
  }),
});

export default deleteAccountValidator;
