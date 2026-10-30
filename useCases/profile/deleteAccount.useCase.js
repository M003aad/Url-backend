import { findUserByIdentity } from '../../services/domain/user.service.js';
import { deleteAccount } from '../../services/domain/profile.service.js';
import comparePassword from '../../utils/comparePassword.util.js';
import { logoutFromAll } from '../../services/JWT/jwt.service.js';

export const deleteAccountUseCase = async (data) => {
  const { userId, password } = data;

  const user = await findUserByIdentity({ id: userId }, '+password');

  await comparePassword(password, user.password);

  await Promise.all([deleteAccount(userId), logoutFromAll(userId)]);
};

export default deleteAccountUseCase;
