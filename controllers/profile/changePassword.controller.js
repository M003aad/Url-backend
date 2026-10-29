import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import changePasswordUseCase from '../../useCases/profile/changePassword.useCase.js';

export async function changePasswordController(req, res, next) {
  try {
    const userId = req.userId;
    const { newPassword } = req.body;
    const data = { userId, newPassword };

    await changePasswordUseCase(data);

    res.status(201).json({
      message: RESPONSE_MESSAGES[SUCCESS_CODES.PASSWORD_CHANGED],
    });
  } catch (err) {
    next(err);
  }
}

export default changePasswordController;
