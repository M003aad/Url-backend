import AppError from '../errors/appError.error.js';
import ERROR_CODES from '../constants/errorCodes.constant.js';
import RESPONSE_MESSAGES from '../constants/responseMessages.constant.js';
import logActivityUseCase from '../useCases/audit/logActivity.useCase.js';

const notFound = (req, res, next) => {

  logActivityUseCase({
    actor: { userId: null, email: null },
    action: 'NOT_FOUND',
    status: 'FAILED',
    context: req.userMetadata,
  });

  next(
    new AppError(RESPONSE_MESSAGES[ERROR_CODES.NOT_FOUND], 404, ERROR_CODES.NOT_FOUND),
  );
};

export default notFound;
