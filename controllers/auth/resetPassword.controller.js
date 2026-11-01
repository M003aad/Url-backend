import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';
import resetPasswordUseCase from '../../useCases/auth/resetPassword.useCase.js';

export async function resetPasswordController(req, res, next) {
  let userId;
  try {
    const rawToken = req.body.code;
    const password = req.body.newPassword;

    userId = await resetPasswordUseCase(rawToken, password);

    res.status(201).json({
      message: RESPONSE_MESSAGES[SUCCESS_CODES.RESET_PASSWORD],
    });

    logActivityUseCase({
      actor: { userId, email: null },
      action: 'AUTH_RESET_PASSWORD',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId: userId || null, email: null },
      action: 'AUTH_RESET_PASSWORD',
      status: 'FAILED',
      failureReason: err.code,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default resetPasswordController;
