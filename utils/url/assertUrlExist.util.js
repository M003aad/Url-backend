import ERROR_CODES from '../../constants/errorCodes.constant.js';
import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import AppError from '../../errors/appError.error.js';

export const assertUrlExist = (rawDoc) => {
  if (!rawDoc) {
    throw new AppError(
      RESPONSE_MESSAGES[ERROR_CODES.URL_NOT_FOUND],
      404,
      ERROR_CODES.URL_NOT_FOUND,
    );
  }
};

export default assertUrlExist;
