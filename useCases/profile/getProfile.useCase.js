import checkUserStatus from '../../utils/checkUserStatus.util.js';
import { assertEmailIsVerified } from '../../utils/assertValidUser.util.js';
import { findUserByIdentity } from '../../services/domain/user.service.js';
import { getCachedProfile, cacheProfile } from '../../cache/profile.cache.js';

export const getProfileUseCase = async (userId) => {
  let profile = await getCachedProfile(userId);

  if (!profile) {
    profile = await findUserByIdentity(
      { id: userId },
      'email firstName lastName emailVerified status',
    );

    if (profile) {
      cacheProfile(userId, profile).catch(() => {});
    }
  }

  assertEmailIsVerified(profile);
  checkUserStatus(profile.status);

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
  };
};

export default getProfileUseCase;
