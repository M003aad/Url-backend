import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import registerUseCase from '../../useCases/auth/register.useCase.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';

export async function registerController(req, res, next) {
  let userId = null;
  let email = req.body?.email;

  try {
    const result = await registerUseCase({ ...req.body });
    userId = result.userId;
    email = result.email || email;

    logActivityUseCase({
      actor: { userId, email },
      action: 'AUTH_REGISTER',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

    return res.status(201).json({
      message: RESPONSE_MESSAGES[SUCCESS_CODES.REGISTER],
    });
  } catch (err) {
    logActivityUseCase({
      actor: { userId: userId || null, email },
      action: 'AUTH_REGISTER',
      status: 'FAILED',
      failureReason: err,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default registerController;