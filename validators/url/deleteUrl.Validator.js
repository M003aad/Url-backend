import Joi from 'joi';
import ERROR_CODES from '../../constants/errorCodes.constant.js';

const deleteUrlValidator = Joi.object({
  params: Joi.object({
    urlId: Joi.string().hex().length(24).required().messages({
      'string.hex': ERROR_CODES.INVALID_ID_FORMAT,
      'string.length': ERROR_CODES.INVALID_ID_LENGTH,
      'any.required': ERROR_CODES.ID_REQUIRED,
    }),
  }),
});

export default deleteUrlValidator;
