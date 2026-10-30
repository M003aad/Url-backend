import authenticateUseCase from '../useCases/auth/authenticate.useCase.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    const authData = await authenticateUseCase(token);

    req.user = authData.user;
    req.userId = authData.userId;
    req.role = authData.role;
    req.sessionId = authData.sessionId;

    next();
  } catch (err) {
    next(err);
  }
};

export default protect;
