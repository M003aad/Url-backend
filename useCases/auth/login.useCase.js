import comparePassword from '../../utils/comparePassword.util.js';
import env from '../../config/env.config.js';
import generateJWT from '../../utils/generateJWT.util.js';
import { createSession } from '../../services/JWT/jwt.service.js';
import { findUserByIdentity } from '../../services/domain/user.service.js';
import AppError from '../../errors/appError.error.js';
import ERROR_CODES from '../../constants/errorCodes.constant.js';

export const loginUseCase = async (data) => {
  try {
    const { email, password } = data;

    const user = await findUserByIdentity(
      { email },
      'email emailVerified status role password',
    );

    if (!user) {
      throw new AppError('Invalid email or password', 401, ERROR_CODES.LOGIN_FAILED);
    }

    if (!user.emailVerified || user.status !== 'active') {
      throw new AppError('Invalid email or password', 401, ERROR_CODES.LOGIN_FAILED);
    }

    await comparePassword(password, user.password);

    const userId = user._id;
    const role = user.role;
    const daysToExpire = 30;
    const expiresAt = new Date(Date.now() + daysToExpire * 24 * 60 * 60 * 1000);

    const savedSession = await createSession(userId, expiresAt);
    
    const sessionId = savedSession._id;

    const accessPayload = {
      userId,
      role,
      sessionId,
    };

    const accessExpire = Number(env.JWT_EXPIRES);
    const accessToken = generateJWT(accessPayload, accessExpire);

    return {
      accessToken,
    };
  } catch (error) {
    throw error;
  }
};

export default loginUseCase;
