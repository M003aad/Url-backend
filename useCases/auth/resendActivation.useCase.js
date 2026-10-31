import mongoose from 'mongoose';
import { findUserByIdentity } from '../../services/domain/user.service.js';
import { createActivationToken } from '../../services/token/Token.service.js';
import generateRandomToken from '../../utils/generateRandomToken.utils.js';
import { sendTypedMail } from '../../services/mail/mail.service.js';
import env from '../../config/env.config.js';
import TYPE_MAIL from '../../constants/typesMail.constant.js';
import { assertEmailNotVerified } from '../../utils/assertValidUser.util.js';
import checkUserStatus from '../../utils/checkUserStatus.util.js';

export const resendActivationUseCase = async (email) => {
  
  const user = await findUserByIdentity(
    { email },
    'email firstName emailVerified status',
  );
  assertEmailNotVerified(user);
  checkUserStatus(user.status);

  const expiresAt = Date.now() + Number(env.ACTIVATION_TOKEN_EXPIRES) * 1000;
  const length = Number(env.LENGTH_ACTIVATION_TOKEN);
  const { rawToken, hashedToken } = generateRandomToken(length);
  const activationLink = `${env.APP_URL}/activate/${rawToken}`;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await createActivationToken(user._id, hashedToken, expiresAt, { session });
    await session.commitTransaction();

    setImmediate(() => {
      sendTypedMail({
        type: TYPE_MAIL.ACTIVATION,
        to: user.email,
        payload: { username: user.firstName, activationLink },
      }).catch((mailError) => {
        console.error(`Mail dispatch failed for ${user.email}:`, mailError);
      });
    });

    return user._id;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export default resendActivationUseCase;