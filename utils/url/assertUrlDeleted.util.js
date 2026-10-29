import ERROR_CODES from '../../constants/errorCodes.constant.js';
import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import AppError from '../../errors/appError.error.js';

export const assertUrlDeleted = (url) => {
  if (!url) {
    throw new AppError(
      RESPONSE_MESSAGES[ERROR_CODES.URL_FAILED_TO_DELETED],
      400,
      ERROR_CODES.URL_FAILED_TO_DELETED,
    );
  }
};

export default assertUrlDeleted;
