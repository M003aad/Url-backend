import verifyJWT from '../../utils/verifyJWT.util.js';
import { assertTokenExists } from '../../utils/assertTokenExists.util.js';
import { findSessionById } from '../../services/JWT/jwt.service.js';
import { findUserByIdentity } from '../../services/domain/user.service.js';
import { assertActiveSession, assertValidDataInSession } from '../../utils/assertValidSession.util.js';
import {  assertRoleMatches } from '../../utils/assertRoleMatches.utils.js'
import {
  assertEmailIsVerified,
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
  
  assertValidDataInSession(session, { userId : decoded.userId });
  assertEmailIsVerified(user);
  checkUserStatus(user.status);
  assertRoleMatches(user.role, decoded.role); // Fixed: Passed clear fields instead of boolean expression

  return {
    user,
    userId: decoded.userId,
    role: decoded.role,
    sessionId: decoded.sessionId,
  };
};

export default authenticateUseCase;
