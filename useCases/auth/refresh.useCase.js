import AppError from '../../errors/appError.error.js';
import ERROR_CODES from '../../constants/errorCodes.constant.js';
import env from '../../config/env.config.js';
import generateJWT from '../../utils/generateJWT.util.js';
import verifyJWT from '../../utils/verifyJWT.util.js';
import {
  findSessionById,
  logout,
} from '../../services/JWT/jwt.service.js';
import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import {
  assertSessionExists,
} from '../../utils/assertValidSession.util.js';

export const refreshUseCase = async (token) => {
    
  console.log("a");
    const verify = verifyJWT(token, { ignoreExpiration: true });

    const { userId, role, sessionId, exp } = verify;

    const session = await findSessionById(sessionId);
    assertSessionExists(session);


    if (session.expiresAt.getTime() < Date.now()) {
      await logout(sessionId);
      throw new AppError(
        RESPONSE_MESSAGES[ERROR_CODES.SESSION_EXPIRED],
        401,
        ERROR_CODES.SESSION_EXPIRED,
      );
    }
    // 4. Token Reuse Window Check (Early Return if current token is completely active)
    const currentTime = Math.floor(Date.now() / 1000);
    if (exp && exp > currentTime) {
      new Date(exp * 1000).toLocaleTimeString();
      return { accessToken: token, userId, isNew: false };
    }

    // 5. Generate fresh new token payload values
    const accessPayload = { userId, role, sessionId };
    const accessExpire = Number(env.JWT_EXPIRES);
    const accessToken = generateJWT(accessPayload, accessExpire);

    return { accessToken, userId, isNew: true };
};

export default refreshUseCase;
