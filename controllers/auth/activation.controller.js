import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';
import activateUseCase from '../../useCases/auth/activate.useCase.js';

export async function activationController(req, res, next) {
  let userId;
  try {
    userId = await activateUseCase(req.params.token);
    res.status(200).json({
      message: RESPONSE_MESSAGES[SUCCESS_CODES.ACTIVATION],
    });

    logActivityUseCase({
      actor: { userId, email: null },
      action: 'AUTH_ACTIVATE',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId: userId || null, email : null },
      action: 'AUTH_ACTIVATE',
      status: 'FAILED',
      failureReason: err,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default activationController;
