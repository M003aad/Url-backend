import mongoose from 'mongoose';
import AppError from '../../errors/appError.error.js';
import ERROR_CODES from '../../constants/errorCodes.constant.js';
import { findUserByIdentity } from '../../services/domain/user.service.js';
import { createResetToken } from '../../services/token/Token.service.js';
import generateRandomToken from '../../utils/generateRandomToken.utils.js';
import { sendTypedMail } from '../../services/mail/mail.service.js';
import TYPE_MAIL from '../../constants/typesMail.constant.js';
import env from '../../config/env.config.js';
import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import checkUserStatus from '../../utils/checkUserStatus.util.js';
import { assertUserExists } from '../../utils/assertValidUser.util.js';

export const forgetPasswordUseCase = async (email) => {
  const user = await findUserByIdentity({ email }, 'email status firstName ');

  assertUserExists(user);
  checkUserStatus(user.status);

  const userId = user._id;
  const expiresAt = Date.now() + Number(env.RESET_TOKEN_EXPIRES) * 1000;
  const length = Number(env.LENGTH_RESET_TOKEN);

  const { rawToken, hashedToken } = generateRandomToken(length);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await createResetToken(userId, hashedToken, expiresAt, { session });

    setImmediate(() => { 
      sendTypedMail({
      type: TYPE_MAIL.RESET,
      to: user.email,
      payload: {
        username: user.firstName,
        rawToken,
      },
    });

    });
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  return userId;
};

export default forgetPasswordUseCase;
