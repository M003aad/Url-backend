import ERROR_CODES from '../constants/errorCodes.constant.js';
import RESPONSE_MESSAGES from '../constants/responseMessages.constant.js';
import AppError from '../errors/appError.error.js';

export const assertExistCode = (urlCode) => {
  if (!urlCode) {
    throw new AppError(
      RESPONSE_MESSAGES[ERROR_CODES.CODE_NOT_FOUND],
      400,
      ERROR_CODES.CODE_NOT_FOUND,
    );
  }
};

export default assertExistCode;
