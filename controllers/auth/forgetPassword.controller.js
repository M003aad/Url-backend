import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';
import forgetPasswordUseCase from '../../useCases/auth/forgetPassword.useCase.js';

export async function forgetPasswordController(req, res, next) {
  let userId;
  let email;
  try {
    email = req.body.email;
    userId = await forgetPasswordUseCase(email);

    res.status(201).json({
      message: RESPONSE_MESSAGES[SUCCESS_CODES.FORGET_PASSWORD],
    });

    logActivityUseCase({
      actor: { userId, email },
      action: 'AUTH_FORGET_PASSWORD',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId: userId || null, email : email || null },
      action: 'AUTH_FORGET_PASSWORD',
      status: 'FAILED',
      failureReason: err,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default forgetPasswordController;
