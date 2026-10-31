import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';
import changePasswordUseCase from '../../useCases/profile/changePassword.useCase.js';

export async function changePasswordController(req, res, next) {
  let userId = req.userId;
  try {
    const { newPassword } = req.body;
    const data = { userId, newPassword };

    await changePasswordUseCase(data);

    res.status(201).json({
      message: RESPONSE_MESSAGES[SUCCESS_CODES.PASSWORD_CHANGED],
    });

    logActivityUseCase({
      actor: { userId, email: null },
      action: 'USER_CHANGE_PASSWORD',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId: userId, email: null },
      action: 'USER_UPDATE_PROFILE',
      status: 'FAILED',
      failureReason: err,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default changePasswordController;
