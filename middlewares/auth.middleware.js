import verifyJWT from '../utils/verifyJWT.util.js';
import { assertTokenExists } from '../utils/assertTokenExists.util.js';
import { assertIpMatches } from '../utils/assertIpMatches.util.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    assertTokenExists(token);
    const decoded = verifyJWT(token);

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    console.log(clientIp);
    assertIpMatches(clientIp, decoded.ip);

    req.userId = decoded.userId;
    req.role = decoded.role;
    req.sessionId = decoded.sessionId;
    req.clientIp = clientIp;

    next();
  } catch (err) {
    next(err);
  }
};

export default protect;
