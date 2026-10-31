import logActivityUseCase from '../useCases/audit/logActivity.useCase.js';
import authenticateUseCase from '../useCases/auth/authenticate.useCase.js';

export const protect = async (req, res, next) => {
  let userId;
  try {
    const token = req.cookies?.accessToken;

    const authData = await authenticateUseCase(token);

    req.user = authData.user;
    req.userId = authData.userId;
    req.role = authData.role;
    req.sessionId = authData.sessionId;

    userId = req.userId;

    logActivityUseCase({
      actor: { userId, email: null },
      action: 'AUTH_PROTECT',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

    next();
  } catch (err) {

    logActivityUseCase({
      actor: { userId : null, email: null },
      action: 'AUTH_PROTECT',
      status: 'FAILED',
      //  the  logs save error cliennt  not real error
      failureReason: err,
      context: req.userMetadata,
    });

    next(err);
  }
};


export default protect;
