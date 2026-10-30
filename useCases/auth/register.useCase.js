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

  console.time('⏱️ 1. Find User');
  const exitUser = await findUserByIdentity({ email }, 'email');
  console.timeEnd('⏱️ 1. Find User');

  assertUniqueField(exitUser);

  console.time('⏱️ 2. Hash Password');
  const hashedPassword = await hashPassword(password);
  console.timeEnd('⏱️ 2. Hash Password');

  const expiresAt = Date.now() + Number(env.ACTIVATION_TOKEN_EXPIRES) * 1000;
  const length = Number(env.LENGTH_ACTIVATION_TOKEN);
  const { rawToken, hashedToken } = generateRandomToken(length);
  const activationLink = `${env.APP_URL}/activate/${rawToken}`;

  console.time('⏱️ 3. DB Transaction');
  const session = await mongoose.startSession();
  session.startTransaction();

  let user;
  try {
    user = await createUser(
      { firstName, lastName, email, password: hashedPassword },
      { session }
    );
    await createActivationToken(user._id, hashedToken, expiresAt, { session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
  console.timeEnd('⏱️ 3. DB Transaction');

  setImmediate(() => {
    sendTypedMail({
      type: TYPE_MAIL.ACTIVATION,
      to: user.email,
      payload: { username: user.firstName, activationLink },
    }).catch((mailError) => {
      console.error(`Mail dispatch failed for ${user.email}:`, mailError);
    });
  });

  return user;
};

export default registerUseCase;
