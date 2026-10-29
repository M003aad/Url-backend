import Joi from 'joi';
import ERROR_CODES from '../../constants/errorCodes.constant.js';

const addUrlValidator = Joi.object({
  body: Joi.object({
    url: Joi.string()
      .trim()
      .max(2048)
      .required()
      .custom((value, helpers) => {
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          return helpers.error('string.invalidProtocol');
        }

        try {
          new URL(value);
        } catch {
          return helpers.error('string.invalidUrl');
        }

        return value;
      })
      .messages({
        'any.required': ERROR_CODES.URL_REQUIRED,
        'string.empty': ERROR_CODES.URL_REQUIRED,
        'string.invalidProtocol': ERROR_CODES.URL_INVALID,
        'string.invalidUrl': ERROR_CODES.URL_INVALID,
        'string.max': ERROR_CODES.URL_TOO_LONG,
      }),
  }),
});

export default addUrlValidator;
