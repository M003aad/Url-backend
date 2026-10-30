import User from '../../models/User.model.js';
import { assertUserExists } from '../../utils/assertValidUser.util.js';

export const updateProfile = async (userId, firstName, lastName) => {
  return User.findByIdAndUpdate(
    userId,
    { firstName: firstName, lastName: lastName },
    { returnDocument: 'after' },
  ).select('firstName lastName email');
};

export const changePassword = async (userId, hashedPassword) => {
  return User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { returnDocument: 'after' },
  );
};

/**
 * Executes soft deletion on a user document.
 * Leverages the User model instance method to trigger pre-save hooks
 * (which cascade delete active sessions, reset tokens, and activation tokens).
 *
 * @param {string} userId - Mongoose ObjectId of the user to delete.
 * @returns {Promise<Object>} Updated user document with deletedAt set.
 */
export const deleteAccount = async (userId) => {
  const user = await User.findById(userId);
  user.status = 'suspended';
  await user.softDelete();
};

export const suspendAccount = async (userId) => {
  await User.findByIdAndUpdate(
    userId,
    { status: 'suspended' },
    { returnDocument: 'after' },
  );
};
