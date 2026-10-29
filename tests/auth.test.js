import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import app from '../app.js';
import { connectDB } from '../config/db.config.js';
import User from '../models/User.model.js';
import ActivationToken from '../models/ActivationToken.model.js';
import ResetToken from '../models/ResetToken.model.js';
import Session from '../models/Session.model.js';

const startTestServer = async () => {
  const server = app.listen(0);
  await once(server, 'listening');
  return server;
};

const randomIp = () => `10.0.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

const buildRequestOptions = (method, body) => {
  const headers = { 'x-forwarded-for': randomIp() };
  const options = { method, headers };

  if (body) {
    headers['content-type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  return options;
};

const request = async (server, path, options = {}) => {
  const address = server.address();
  const port = typeof address === 'object' && address !== null ? address.port : 0;
  return fetch(`http://127.0.0.1:${port}${path}`, options);
};

test('auth validation and route coverage with request data', async (t) => {
  const server = await startTestServer();

  try {
    const cases = [
      {
        name: 'auth ping',
        path: '/auth/ping',
        method: 'GET',
        expectedStatus: 200,
      },
      {
        name: 'register invalid email',
        path: '/auth/register',
        method: 'POST',
        body: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'not-an-email',
          password: 'Password1!',
        },
        expectedStatus: 400,
      },
      {
        name: 'register invalid password',
        path: '/auth/register',
        method: 'POST',
        body: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          password: 'weak',
        },
        expectedStatus: 400,
      },
      {
        name: 'login invalid email format',
        path: '/auth/login',
        method: 'POST',
        body: {
          email: 'login-invalid',
          password: 'Password1!',
        },
        expectedStatus: 400,
      },
      {
        name: 'login invalid password length',
        path: '/auth/login',
        method: 'POST',
        body: {
          email: 'user@example.com',
          password: 'short',
        },
        expectedStatus: 400,
      },
      {
        name: 'resend activation missing email',
        path: '/auth/resend-activate',
        method: 'POST',
        body: {},
        expectedStatus: 400,
      },
      {
        name: 'forget-password invalid email',
        path: '/auth/forget-password',
        method: 'POST',
        body: { email: 'invalid-email' },
        expectedStatus: 400,
      },
      {
        name: 'reset-password invalid code length',
        path: '/auth/reset-password',
        method: 'POST',
        body: { code: '123', newPassword: 'Password1!' },
        expectedStatus: 400,
      },
      {
        name: 'reset-password invalid new password',
        path: '/auth/reset-password',
        method: 'POST',
        body: { code: '123456', newPassword: 'short' },
        expectedStatus: 400,
      },
      {
        name: 'logout requires token',
        path: '/auth/logout',
        method: 'POST',
        expectedStatus: 403,
      },
    ];

    for (const routeCase of cases) {
      await t.test(routeCase.name, async () => {
        const response = await request(server, routeCase.path, buildRequestOptions(routeCase.method, routeCase.body));
        assert.strictEqual(response.status, routeCase.expectedStatus, `${routeCase.name} status`);
      });
    }
  } finally {
    server.close();
  }
});

test('real account lifecycle: register, resend activation, activate, forget, reset, login', async () => {
  await connectDB();

  const originalCreateTransport = nodemailer.createTransport;
  const capturedEmails = [];
  nodemailer.createTransport = () => ({
    sendMail: async (mailOptions) => {
      capturedEmails.push(mailOptions);
      return { messageId: 'test-mail-id' };
    },
  });

  const server = await startTestServer();
  const testEmail = `test.user+${Date.now()}@example.com`;
  const originalPassword = 'StrongPass1!';
  const newPassword = 'StrongerPass2!';

  try {
    const registerResponse = await request(server, '/auth/register', buildRequestOptions('POST', {
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: originalPassword,
    }));

    assert.strictEqual(registerResponse.status, 201);
    const registerBody = await registerResponse.json();
    assert.ok(registerBody.message.includes('Registration'));

    const createdUser = await User.findOne({ email: testEmail });
    assert.ok(createdUser, 'Expected user to exist after register');
    assert.strictEqual(createdUser.emailVerified, false);

    assert.ok(capturedEmails.length > 0, 'Expected activation email to be captured');
    const firstActivationHtml = capturedEmails[0].html || capturedEmails[0].text || '';
    const activationLinkMatch = firstActivationHtml.match(/href="([^"]+)"/);
    assert.ok(activationLinkMatch, 'Activation link not found in email HTML');
    const firstActivationToken = activationLinkMatch[1].split('/').pop();

    const resendResponse = await request(server, '/auth/resend-activate', buildRequestOptions('POST', {
      email: testEmail,
    }));

    assert.strictEqual(resendResponse.status, 201);
    assert.ok(capturedEmails.length > 1, 'Expected resend activation email to be captured');
    const resentActivationHtml = capturedEmails[1].html || capturedEmails[1].text || '';
    const resentActivationLinkMatch = resentActivationHtml.match(/href="([^"]+)"/);
    assert.ok(resentActivationLinkMatch, 'Resend activation link not found in email HTML');
    const resendActivationToken = resentActivationLinkMatch[1].split('/').pop();

    const activateResponse = await request(server, `/auth/activate/${resendActivationToken}`, buildRequestOptions('GET'));
    assert.strictEqual(activateResponse.status, 200);
    const activateBody = await activateResponse.json();
    assert.ok(activateBody.message.includes('activated'));

    const activatedUser = await User.findOne({ email: testEmail });
    assert.ok(activatedUser, 'Expected user to still exist after activation');
    assert.strictEqual(activatedUser.emailVerified, true);

    const forgetResponse = await request(server, '/auth/forget-password', buildRequestOptions('POST', {
      email: testEmail,
    }));

    assert.strictEqual(forgetResponse.status, 201);
    assert.ok(capturedEmails.length > 2, 'Expected forget password email to be captured');
    const resetEmailHtml = capturedEmails[2].html || capturedEmails[2].text || '';
    const resetTokenMatch = resetEmailHtml.match(/>([0-9a-fA-F]{6})</);
    assert.ok(resetTokenMatch, 'Reset token not found in email HTML');
    const resetToken = resetTokenMatch[1];

    const resetResponse = await request(server, '/auth/reset-password', buildRequestOptions('POST', {
      code: resetToken,
      newPassword,
    }));

    assert.strictEqual(resetResponse.status, 201);
    const resetBody = await resetResponse.json();
    assert.ok(resetBody.message.includes('successfully reset'));

    const loginResponse = await request(server, '/auth/login', buildRequestOptions('POST', {
      email: testEmail,
      password: newPassword,
    }));

    assert.strictEqual(loginResponse.status, 201);
    const loginBody = await loginResponse.json();
    assert.ok(loginBody.message.includes('Welcome back'));
  } finally {
    server.close();
    nodemailer.createTransport = originalCreateTransport;
    await ActivationToken.deleteMany({ user: (await User.findOne({ email: testEmail }))?._id });
    await ResetToken.deleteMany({ user: (await User.findOne({ email: testEmail }))?._id });
    await Session.deleteMany({ userId: (await User.findOne({ email: testEmail }))?._id });
    await User.deleteOne({ email: testEmail });
    await mongoose.disconnect();
  }
});