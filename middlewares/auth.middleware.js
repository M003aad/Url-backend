import verifyJWT from '../utils/verifyJWT.util.js';
import { assertTokenExists } from '../utils/assertTokenExists.util.js';
// create use case to check user and to less query
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    assertTokenExists(token);
    const decoded = verifyJWT(token);
  
    req.userId = decoded.userId;
    req.role = decoded.role;
    req.sessionId = decoded.sessionId;

    next();
  } catch (err) {
    next(err);
  }
};

export default protect;
