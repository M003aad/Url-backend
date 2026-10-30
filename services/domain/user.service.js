import User from '../../models/User.model.js';
import ERROR_CODES from '../../constants/errorCodes.constant.js';
import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import AppError from '../../errors/appError.error.js';
// import cron from 'node-cron';

export const createUser = async (data, options = {}) => {
  const [user] = await User.create([data], options);
  return user;

  if (err.code === 11000) {
    const conflictField = Object.keys(err.keyValue || {})[0];

    const errorCode =
      conflictField === 'email'
        ? ERROR_CODES.EMAIL_ALREADY_EXISTS
        : ERROR_CODES.USERNAME_ALREADY_EXISTS;

    throw new AppError(RESPONSE_MESSAGES[errorCode], 409, errorCode);
  }
};
export const activateAccount = async (userId) => {
  return User.findByIdAndUpdate(
    userId,
    { emailVerified: true },
    { returnDocument: 'after' },
  ).select('userId emailVerified');
};

export const resetPasswordByUser = async (userId, hashedPassword) => {
  await User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { returnDocument: 'after' },
  );
};

/**
 * Finds a user by ID, email, or username dynamically.
 * @param {Object} identifiers - { id, email, username }
 * @param {string} [selectFields] - Optional Space-separated fields to select/project
 */
export const findUserByIdentity = async ({ id, email }, selectFields = '') => {
  const query = [];

  if (id) query.push({ _id: id });
  if (email) query.push({ email });

  if (query.length === 0) return null;

  return await User.findOne(query.length > 1 ? { $or: query } : query[0]).select(
    selectFields,
  );
};

// export const initCleanupJob = () => {
//   cron.schedule('26 14 * * *', async () => {
//     try {
//       const thirtyDaysAgo = new Date(Date.now() - 10 * 1000);
//       const expiredUsers = await User.collection
//         .find({
//           deletedAt: { $ne: null, $lte: thirtyDaysAgo },
//         })
//         .toArray();

//       if (expiredUsers.length === 0) {
//         return;
//       }
//       for (const doc of expiredUsers) {
//         User.hydrate(doc);
//         user.deleteOne();
//       }
//     } catch (error) {}
//   });
// };
