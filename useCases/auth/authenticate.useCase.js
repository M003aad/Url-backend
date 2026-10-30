import verifyJWT from '../../utils/verifyJWT.util.js';
import { assertTokenExists } from '../../utils/assertTokenExists.util.js';
import { findSessionById } from '../../services/JWT/jwt.service.js';
import { findUserByIdentity } from '../../services/domain/user.service.js';
import { assertActiveSession } from '../../utils/assertValidSession.util.js';
import {
  assertEmailIsVerified,
  assertUserExists,
} from '../../utils/assertValidUser.util.js';
import checkUserStatus from '../../utils/checkUserStatus.util.js';

export const authenticateUseCase = async (token) => {
  assertTokenExists(token);
  const decoded = verifyJWT(token);

  const session = await findSessionById(decoded.sessionId);
  assertActiveSession(session);

  const user = await findUserByIdentity(
    { id: decoded.userId },
    'firstName lastName email emailVerified status role',
  );

  assertUserExists(user);
  assertEmailIsVerified(user);
  checkUserStatus(user.status);

  return {
    user,
    userId: decoded.userId,
    role: decoded.role,
    sessionId: decoded.sessionId,
  };
};

export default authenticateUseCase;
