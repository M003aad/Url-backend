import checkUserStatus from '../../utils/checkUserStatus.util.js';
import { assertEmailIsVerified } from '../../utils/assertValidUser.util.js';
import { findUserByIdentity } from '../../services/domain/user.service.js';
import { updateProfile } from '../../services/domain/profile.service.js';

export const updateProfileUseCase = async (data) => {

    const { userId, firstName, lastName } = data;
    const user = await findUserByIdentity(
      { id: userId },
      'email firstName lastName emailVerified status',
    );

    assertEmailIsVerified(user);
    checkUserStatus(user.status);

    const profile = await updateProfile(userId, firstName, lastName);

    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
    };
};

export default updateProfileUseCase;
