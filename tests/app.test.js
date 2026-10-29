import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../app.js';

const startTestServer = async () => {
  const server = app.listen(0);
  await once(server, 'listening');
  return server;
};

const randomIp = () => `10.0.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

const buildRequestOptions = (method, body) => {
  const options = { method, headers: { 'x-forwarded-for': randomIp() } };
  if (body) {
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  return options;
};

const request = async (server, path, options = {}) => {
  const address = server.address();
  const port = typeof address === 'object' && address !== null ? address.port : 0;
  return fetch(`http://127.0.0.1:${port}${path}`, options);
};

test('global route coverage for all app routes', async (t) => {
  const server = await startTestServer();

  try {
    const cases = [
      { name: 'favicon', path: '/favicon.ico', method: 'GET', expectedStatus: 204 },
      { name: 'auth ping', path: '/auth/ping', method: 'GET', expectedStatus: 200 },
      {
        name: 'register validation',
        path: '/auth/register',
        method: 'POST',
        body: {},
        expectedStatus: 400,
      },
      {
        name: 'activation validation',
        path: '/auth/activate/short',
        method: 'GET',
        expectedStatus: 400,
      },
      {
        name: 'resend activation validation',
        path: '/auth/resend-activate',
        method: 'POST',
        body: {},
        expectedStatus: 400,
      },
      {
        name: 'login validation',
        path: '/auth/login',
        method: 'POST',
        body: {},
        expectedStatus: 400,
      },
      { name: 'logout token missing', path: '/auth/logout', method: 'POST', expectedStatus: 403 },
      {
        name: 'logoutFromAll token missing',
        path: '/auth/logoutFromAll',
        method: 'POST',
        expectedStatus: 403,
      },
      {
        name: 'forget password validation',
        path: '/auth/forget-password',
        method: 'POST',
        body: {},
        expectedStatus: 400,
      },
      {
        name: 'reset password validation',
        path: '/auth/reset-password',
        method: 'POST',
        body: {},
        expectedStatus: 400,
      },
      { name: 'refresh token missing', path: '/auth/refresh', method: 'POST', expectedStatus: 403 },
      { name: 'profile me protected', path: '/profile/me', method: 'GET', expectedStatus: 403 },
      {
        name: 'profile me update protected',
        path: '/profile/me',
        method: 'PUT',
        body: {},
        expectedStatus: 403,
      },
      {
        name: 'profile change password protected',
        path: '/profile/change-password',
        method: 'PUT',
        body: {},
        expectedStatus: 403,
      },
      {
        name: 'profile delete account protected',
        path: '/profile/delete-account',
        method: 'PATCH',
        body: {},
        expectedStatus: 403,
      },
      {
        name: 'add url protected',
        path: '/add-url',
        method: 'POST',
        body: { url: 'https://example.com' },
        expectedStatus: 403,
      },
      {
        name: 'shortcode validation',
        path: '/r/invalid',
        method: 'GET',
        expectedStatus: 400,
      },
      {
        name: 'delete url invalid id validation',
        path: '/delete-url/invalid',
        method: 'DELETE',
        expectedStatus: 403,
      },
      { name: 'get all urls protected', path: '/getAllUrls', method: 'GET', expectedStatus: 403 },
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
