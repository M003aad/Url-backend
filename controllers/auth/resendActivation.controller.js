import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';
import resendActivationUseCase from '../../useCases/auth/resendActivation.useCase.js';

export async function resendActivationController(req, res, next) {
  let userId;
  let email = req.body.email;

  try {

    userId = await resendActivationUseCase(email);
    
    res.status(200).json({
      message: RESPONSE_MESSAGES[SUCCESS_CODES.RESEND_ACTIVATION],
    });

    logActivityUseCase({
      actor: { userId, email },
      action: 'AUTH_RESEND_ACTIVATE',
      status: 'SUCCESS',
      context: req.userMetadata,
    });


  } catch (err) {
     logActivityUseCase({
      actor: { userId: userId || null, email: email || null },
      action: 'AUTH_RESEND_ACTIVATE',
      status: 'FAILED',
      failureReason: err.message || err,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default resendActivationController;