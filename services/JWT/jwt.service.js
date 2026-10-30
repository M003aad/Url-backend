import Session from '../../models/Session.model.js';

export const createSession = async (userId, expiresAt) => {
  await Session.deleteMany({
    userId,
  });

  return await Session.create({
    userId,
    expiresAt,
  });
};

export const findSessionById = async (sessionId) => {
  return await Session.findById(sessionId);
};

export const logout = async (sessionId) => {
  return await Session.findByIdAndDelete(sessionId);
};

export const logoutFromAll = async (userId) => {
  return await Session.deleteMany({ userId: userId });
};
