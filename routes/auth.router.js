import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';

import registerValidator from '../validators/auth/register.validator.js';
import registerController from '../controllers/auth/register.controller.js';

import activationController from '../controllers/auth/activation.controller.js';
import activationValidator from '../validators/auth/activation.validator.js';

import resendActivationValidator from '../validators/auth/resendActivation.validator.js';
import resendActivationController from '../controllers/auth/resendActivation.controller.js';

import loginValidator from '../validators/auth/login.validator.js';
import loginController from '../controllers/auth/login.controller.js';
import logoutController from '../controllers/auth/logout.controller.js';
import logoutFromAllController from '../controllers/auth/logoutFromAll.controller.js';

import forgetPasswordValidator from '../validators/auth/forgetPassword.validator.js';
import forgetPasswordController from '../controllers/auth/forgetPassword.controller.js';
import resetPasswordValidator from '../validators/auth/resetPassword.validator.js';
import resetPasswordController from '../controllers/auth/resetPassword.controller.js';

import {
  authRateLimit,
  registerRateLimit,
  emailSpamRateLimit,
} from '../middlewares/rateLimit.middleware.js';
import { refreshController } from '../controllers/auth/refresh.controller.js';

const authRouter = Router();

authRouter.get('/ping', (req, res) => {
  res.json({ success: true, message: 'auth service up' });
});

authRouter.post(
  '/register',
  registerRateLimit,
  validate(registerValidator),
  registerController,
);

authRouter.get('/activate/:token', validate(activationValidator), activationController);

authRouter.post(
  '/resend-activate',
  emailSpamRateLimit,
  validate(resendActivationValidator),
  resendActivationController,
);

authRouter.post('/login', authRateLimit, validate(loginValidator), loginController);

authRouter.post('/logout', logoutController);

authRouter.post('/logoutFromAll', logoutFromAllController);

authRouter.post(
  '/forget-password',
  emailSpamRateLimit,
  validate(forgetPasswordValidator),
  forgetPasswordController,
);

authRouter.post(
  '/reset-password',
  authRateLimit,
  validate(resetPasswordValidator),
  resetPasswordController,
);

authRouter.post('/refresh', refreshController);

export default authRouter;
