import { findSessionById, logout } from '../../services/JWT/jwt.service.js';
import verifyJWT from '../../utils/verifyJWT.util.js';
import { assertUserExists } from '../../utils/assertValidUser.util.js';
import assertValidSessionPayload from '../../utils/assertValidSessionPayload.util.js';
import { findUserByIdentity } from '../../services/domain/user.service.js';
import { assertSessionExists } from '../../utils/assertValidSession.util.js';

export const logoutUseCase = async (token) => {
  const verify = verifyJWT(token, { ignoreExpiration: true });
  const { userId, role, sessionId } = verify;

  assertValidSessionPayload({ userId, role, sessionId });

  const session = await findSessionById(sessionId);
  assertSessionExists(session);

  const user = await findUserByIdentity({ id: userId });

  await logout(sessionId);

  return userId;
};
export default logoutUseCase;
