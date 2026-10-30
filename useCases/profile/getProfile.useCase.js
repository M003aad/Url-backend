import checkUserStatus from '../../utils/checkUserStatus.util.js';
import { assertEmailIsVerified } from '../../utils/assertValidUser.util.js';
import { findUserByIdentity } from '../../services/domain/user.service.js';

export const getProfileUseCase = async (userId) => {
  
  const profile = await findUserByIdentity(
      { id: userId },
      'email firstName lastName emailVerified status',
    );

  assertEmailIsVerified(profile);
  checkUserStatus(profile.status);

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
  };
};

export default getProfileUseCase;
