import deleteAccountUseCase from '../../useCases/profile/deleteAccount.useCase.js';

export async function deleteAccountController(req, res) {
  try {
    const userId = req.userId;
    const { password } = req.body;
    const data = { userId, password };

    await deleteAccountUseCase(data);
    res.clearCookie('accessToken');
    res.status(200).json({
      message: 'Account deleted successfully',
    });
  } catch (err) {
    throw err;
  }
}

export default deleteAccountController;
