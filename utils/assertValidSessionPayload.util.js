import RESPONSE_MESSAGES from '../constants/responseMessages.constant.js';
import ERROR_CODES from '../constants/errorCodes.constant.js';
import AppError from '../errors/appError.error.js';

/**
 * Asserts that all mandatory session payload attributes exist.
 * @param {Object} payload - { userId, role, sessionId }
 */
export const assertValidSessionPayload = ( sessionId ) => {

  if (!sessionId) {
    throw new AppError(
      RESPONSE_MESSAGES[ERROR_CODES.UNAUTHORIZED],
      401,
      ERROR_CODES.SESSION_INVALID,
    );
  }
};

export default assertValidSessionPayload;
