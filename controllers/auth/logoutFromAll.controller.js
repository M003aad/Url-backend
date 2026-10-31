import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import logoutFromAllUseCase from '../../useCases/auth/logoutFromAll.useCase.js';
import { assertTokenExists } from '../../utils/assertTokenExists.util.js';
import logActivity from '../../services/audit.service.js';

export async function logoutFromAllController(req, res) {
  let userId;
  try {
    const token = req.cookies?.accessToken;

    assertTokenExists(token);

    userId = await logoutFromAllUseCase(token);

    
    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'strict',
    });

    res.status(201).json({ message: RESPONSE_MESSAGES[SUCCESS_CODES.LOGOUT] });
    
    logActivity({
      actor: { userId: userId, email: null },
      action: 'AUTH_LOGOUTFROMALL',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (error) {
    console.log(error);

    logActivity({
      actor: { userId: userId || null, email: null },
      action: 'AUTH_LOGOUTFROMALL',
      status: 'FAILED',
      failureReason: err,
      context: req.userMetadata,
    });

    throw error;
  }
}

export default logoutFromAllController;
