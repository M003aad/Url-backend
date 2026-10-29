import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import protect from '../middlewares/auth.middleware.js';
import {
  profileUpdateRateLimit,
  sensitiveActionRateLimit,
} from '../middlewares/rateLimit.middleware.js';

import updateProfileValidator from '../validators/profile/updateProfile.validator.js';
import getProfileController from '../controllers/profile/getProfile.controller.js';
import updateProfileController from '../controllers/profile/updateProfile.controller.js';
import changePasswordValidator from '../validators/profile/changePassword.validator.js';
import changePasswordController from '../controllers/profile/changePassword.controller.js';
import deleteAccountValidator from '../validators/profile/deleteAccount.validator.js';
import deleteAccountController from '../controllers/profile/deleteAccount.controller.js';

const profileRouter = Router();

profileRouter.get('/me', protect, getProfileController);

profileRouter.put(
  '/me',
  protect,
  profileUpdateRateLimit,
  validate(updateProfileValidator),
  updateProfileController,
);

profileRouter.put(
  '/change-password',
  protect,
  sensitiveActionRateLimit,
  validate(changePasswordValidator),
  changePasswordController,
);

profileRouter.patch(
  '/delete-account',
  protect,
  sensitiveActionRateLimit,
  validate(deleteAccountValidator),
  deleteAccountController,
);

export default profileRouter;
