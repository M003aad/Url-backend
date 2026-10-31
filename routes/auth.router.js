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

import { refreshController } from '../controllers/auth/refresh.controller.js';

import protect from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.get('/ping', (req, res) => {
  res.json({ success: true, message: 'auth service up' });
});

authRouter.post('/register', validate(registerValidator), registerController);

authRouter.get('/activate/:token', validate(activationValidator), activationController);

authRouter.post(
  '/resend-activate',
  validate(resendActivationValidator),
  resendActivationController,
);

authRouter.post('/login', validate(loginValidator), loginController);

authRouter.post('/logout', protect, logoutController);

authRouter.post('/logoutFromAll', protect, logoutFromAllController);

authRouter.post(
  '/forget-password',
  validate(forgetPasswordValidator),
  forgetPasswordController,
);

authRouter.post(
  '/reset-password',
  validate(resetPasswordValidator),
  resetPasswordController,
);

authRouter.post('/refresh', protect, refreshController);

export default authRouter;
