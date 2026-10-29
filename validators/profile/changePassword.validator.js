import Joi from 'joi';
import ERROR_CODES from '../../constants/errorCodes.constant.js';

const changePasswordValidator = Joi.object({
  body: Joi.object({
    newPassword: Joi.string().min(8).required().messages({
      'any.required': ERROR_CODES.PASSWORD_REQUIRED,
      'string.empty': ERROR_CODES.PASSWORD_REQUIRED,
      'string.min': ERROR_CODES.PASSWORD_TOO_SHORT,
    }),
  }),
});

export default changePasswordValidator;
