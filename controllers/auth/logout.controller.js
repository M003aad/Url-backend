import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import { logActivityUseCase } from '../../useCases/audit/logActivity.useCase.js';
import logoutUseCase from '../../useCases/auth/logout.useCase.js';
import { assertTokenExists } from '../../utils/assertTokenExists.util.js';

export async function logoutController(req, res) {
  let userId = null;
  try {
    const token = req.cookies?.accessToken;
    assertTokenExists(token);

    const userId = await logoutUseCase(token);

    
    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'strict',
    });
    
    res.status(201).json({
      message: RESPONSE_MESSAGES[SUCCESS_CODES.LOGOUT],
    });
    
    logActivityUseCase({
      actor: { userId: userId, email: null },
      action: 'AUTH_LOGOUT',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (error) {

    logActivityUseCase({
      actor: { userId: userId || null , email: null },
      action: 'AUTH_LOGOUT',
      status: 'FAILED',
      failureReason: err.code,
      context: req.userMetadata,
    });

    throw error;
  }
}

export default logoutController;
