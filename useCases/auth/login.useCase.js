import comparePassword from '../../utils/comparePassword.util.js';
import env from '../../config/env.config.js';
import generateJWT from '../../utils/generateJWT.util.js';
import { createSession } from '../../services/JWT/jwt.service.js';
import { findUserByIdentity } from '../../services/domain/user.service.js';
import AppError from '../../errors/appError.error.js';
import ERROR_CODES from '../../constants/errorCodes.constant.js';

export const loginUseCase = async (data) => {
  const { email, password } = data;

  console.time('⏱️ 1. Find User');
  const user = await findUserByIdentity(
    { email },
    'email emailVerified status role password',
  );
  console.timeEnd('⏱️ 1. Find User');

  if (!user || !user.emailVerified || user.status !== 'active') {
    throw new AppError('Invalid email or password', 401, ERROR_CODES.LOGIN_FAILED);
  }

  console.time('⏱️ 2. Compare Password');
  await comparePassword(password, user.password);
  console.timeEnd('⏱️ 2. Compare Password');

  const userId = user._id;
  const role = user.role;
  const daysToExpire = 30;
  const expiresAt = new Date(Date.now() + daysToExpire * 24 * 60 * 60 * 1000);

  console.time('⏱️ 3. Create Session DB');
  const savedSession = await createSession(userId, expiresAt);
  console.timeEnd('⏱️ 3. Create Session DB');

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
};

export default loginUseCase;