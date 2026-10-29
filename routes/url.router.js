import { Router } from 'express';
import validate from '../middlewares/validate.middleware.js';
import protect from '../middlewares/auth.middleware.js';
import {
  urlCreateRateLimit,
  urlRedirectRateLimit,
} from '../middlewares/rateLimit.middleware.js';

import addUrlController from '../controllers/url/addUrl.controller.js';
import addUrlValidator from '../validators/url/addUrl.validator.js';
import getOriginalUrlByCodeValidator from '../validators/url/getOriginalUrlByCode.validator.js';
import getOriginalUrlByCodeController from '../controllers/url/getOriginalUrlByCode.controller.js';
import deleteUrlValidator from '../validators/url/deleteUrl.Validator.js';
import deleteUrlController from '../controllers/url/deleteUrl.controller.js';
import getallUrlsController from '../controllers/url/getAllUrls.contsoller.js';

const urlRouter = Router();

// Apply creation limiter (10 per minute)
urlRouter.post(
  '/add-url',
  protect,
  urlCreateRateLimit,
  validate(addUrlValidator),
  addUrlController,
);

// Apply public redirect/lookup limiter (100 per minute)
urlRouter.get(
  '/r/:code',
  urlRedirectRateLimit,
  validate(getOriginalUrlByCodeValidator),
  getOriginalUrlByCodeController,
);

urlRouter.delete(
  '/delete-url/:urlId',
  protect,
  validate(deleteUrlValidator),
  deleteUrlController,
);

urlRouter.get('/getAllUrls', protect, getallUrlsController);

export default urlRouter;
