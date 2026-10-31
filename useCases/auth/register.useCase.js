import mongoose from 'mongoose';
import { createUser, findUserByIdentity } from '../../services/domain/user.service.js';

import { sendTypedMail } from '../../services/mail/mail.service.js';
import { createActivationToken } from '../../services/token/Token.service.js';

import TYPE_MAIL from '../../constants/typesMail.constant.js';
import env from '../../config/env.config.js';
import hashPassword from '../../utils/hashPassword.util.js';
import generateRandomToken from '../../utils/generateRandomToken.utils.js';
import assertUniqueField from '../../utils/assertUniqueField.util.js';

export const registerUseCase = async (data) => {
  const { firstName, lastName, email, password } = data;
  const exitUser = await findUserByIdentity({ email }, 'email');

  assertUniqueField(exitUser);

  const hashedPassword = await hashPassword(password);

  const expiresAt = Date.now() + Number(env.ACTIVATION_TOKEN_EXPIRES) * 1000;
  const length = Number(env.LENGTH_ACTIVATION_TOKEN);
  const { rawToken, hashedToken } = generateRandomToken(length);
  const activationLink = `${env.APP_URL}/activate/${rawToken}`;

  const session = await mongoose.startSession();
  session.startTransaction();

  let user;
  try {
    user = await createUser(
      { firstName, lastName, email, password: hashedPassword },
      { session },
    );
    await createActivationToken(user._id, hashedToken, expiresAt, { session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  setImmediate(() => {
    sendTypedMail({
      type: TYPE_MAIL.ACTIVATION,
      to: user.email,
      payload: { username: user.firstName, activationLink },
    }).catch((mailError) => {
      console.error(`Mail dispatch failed for ${user.email}:`, mailError);
    });
  });
  const userId = user._id;

  return { userId, email };
};

export default registerUseCase;
