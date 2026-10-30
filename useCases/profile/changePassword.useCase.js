import checkUserStatus from '../../utils/checkUserStatus.util.js';
import { assertEmailIsVerified } from '../../utils/assertValidUser.util.js';
import { findUserByIdentity } from '../../services/domain/user.service.js';
import { changePassword } from '../../services/domain/profile.service.js';
import hashPassword from '../../utils/hashPassword.util.js';
import assertPasswordNotSameAsOld from '../../utils/assertPasswordNotSameAsOld.util.js';

export const changePasswordUseCase = async (data) => {
    const { userId, newPassword } = data;
    const user = await findUserByIdentity(
      { id: userId },
      'emailVerified status password',
    );

    assertEmailIsVerified(user);
    checkUserStatus(user.status);

    await assertPasswordNotSameAsOld(newPassword, user.password);
    const hashedPassword = await hashPassword(newPassword);

    await changePassword(userId, hashedPassword);
};

export default changePasswordUseCase;
