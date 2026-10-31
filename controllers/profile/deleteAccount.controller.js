import deleteAccountUseCase from '../../useCases/profile/deleteAccount.useCase.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';

export async function deleteAccountController(req, res) {
  let userId = req.userId;
  try {
    const { password } = req.body;
    const data = { userId, password };

    await deleteAccountUseCase(data);
    res.clearCookie('accessToken');
    res.status(200).json({
      message: 'Account deleted successfully',
    });

    logActivityUseCase({
      actor: { userId, email: null },
      action: 'USER_DELETE_PROFILE',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId: userId, email: null },
      action: 'USER_DELETE_PROFILE',
      status: 'FAILED',
      failureReason: err,
      context: req.userMetadata,
    });

    throw err;
  }
}

export default deleteAccountController;
