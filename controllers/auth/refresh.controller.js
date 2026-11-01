import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import refreshUseCase from '../../useCases/auth/refresh.useCase.js';
import cookieConfig from '../../config/cookie.config.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';

export const refreshController = async (req, res, next) => {
  let userId = req.userId;
  try {
    const token = req.cookies?.accessToken;

    const result = await refreshUseCase(token);
    if (!result.isNew) {
      logActivityUseCase({
        actor: { userId, email: null },
        action: 'AUTH_REFRESH',
        status: 'SUCCESS',
        failureReason: 'The access token is still active and valid.',
        context: req.userMetadata,
      });
      return res.status(200).json({
        message: 'The access token is still active and valid.',
      });
    }
    res.cookie('accessToken', result.accessToken, {
      ...cookieConfig,
    });

    res.status(200).json({
      message: RESPONSE_MESSAGES[SUCCESS_CODES.REFRESH_TOKEN],
    });

    logActivityUseCase({
      actor: { userId, email: null },
      action: 'AUTH_REFRESH',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId, email: null },
      action: 'AUTH_REFRESH',
      status: 'FAILED',
      failureReason: err.code,
      context: req.userMetadata,
    });

    next(err);
  }
};
