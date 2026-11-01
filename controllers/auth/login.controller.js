import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import loginUseCase from '../../useCases/auth/login.useCase.js';
import { cookieConfig, TOKEN_LIFETIMES } from '../../config/cookie.config.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';

export async function loginController(req, res, next) {
  let { email, password } = req.body;

  try {
    const data = { email, password };

    const { accessToken, userId } = await loginUseCase(data);

    
    res.cookie('accessToken', accessToken, {
      ...cookieConfig,
      maxAge: TOKEN_LIFETIMES.ACCESS_TOKEN_MS,
    });
    
    res.status(201).json({
      message: RESPONSE_MESSAGES[SUCCESS_CODES.LOGIN],
    });
    
    logActivityUseCase({
      actor: { userId: userId, email: email },
      action: 'AUTH_LOGIN',
      status: 'SUCCESS',
      context: req.userMetadata, 
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId: null, email: email},
      action: 'AUTH_LOGIN',
      status: 'FAILED',
      failureReason: err.code,
      context: req.userMetadata, 
    });

    next(err);
  }
}

export default loginController;
