import Joi from 'joi';
import ERROR_CODES from '../../constants/errorCodes.constant.js';

const getOriginalUrlByCodeValidator = Joi.object({
  params: Joi.object({
    code: Joi.string().alphanum().trim().length(8).required().messages({
      'any.required': ERROR_CODES.URLID_REQUIRED,
      'string.empty': ERROR_CODES.URLID_REQUIRED,
      'string.length': ERROR_CODES.INVALID_CODE_LENGTH,
    }),
  }),
});

export default getOriginalUrlByCodeValidator;
