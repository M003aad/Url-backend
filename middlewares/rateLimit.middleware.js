import AppError from '../errors/appError.error.js';
import ERROR_CODES from '../constants/errorCodes.constant.js';
import { RESPONSE_MESSAGES } from '../constants/responseMessages.constant.js';
import {
  globalLimiterConfig,
  authLimiterConfig,
  registerLimiterConfig,
  emailSpamLimiterConfig,
  urlCreateLimiterConfig,
  urlRedirectLimiterConfig,
  profileUpdateLimiterConfig,
  sensitiveActionLimiterConfig,
} from '../config/rateLimit.config.js';

const createRateLimiterMiddleware = (config) => {
  return async (req, res, next) => {
    try {
      // Prioritize authenticated User ID > Request Body Email > Client IP
      const targetIdentifier = req.userId || req.body?.email || 'anonymous';
      const clientKey = `${req.ip}:${targetIdentifier}`;

      const { totalHits, resetTime } = await config.store.increment(clientKey);

      if (config.standardHeaders === 'draft-8') {
        res.setHeader('RateLimit-Limit', config.limit);
        res.setHeader('RateLimit-Remaining', Math.max(0, config.limit - totalHits));

        const deltaSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
        res.setHeader('RateLimit-Reset', Math.max(0, deltaSeconds));
      }

      if (totalHits > config.limit) {
        const retryAfter = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
        res.setHeader('Retry-After', Math.max(0, retryAfter));

        const specificErrorCode = config.errorCode || ERROR_CODES.RATELIMIT;

        throw new AppError(
          RESPONSE_MESSAGES[specificErrorCode] || 'Too many requests.',
          429,
          specificErrorCode,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// --- AUTH EXPORTS (This fixes your auth.router.js error) ---
export const globalRateLimit = createRateLimiterMiddleware(globalLimiterConfig);
export const authRateLimit = createRateLimiterMiddleware(authLimiterConfig);
export const registerRateLimit = createRateLimiterMiddleware(registerLimiterConfig);
export const emailSpamRateLimit = createRateLimiterMiddleware(emailSpamLimiterConfig);

// --- OTHER ROUTES EXPORTS ---
export const urlCreateRateLimit = createRateLimiterMiddleware(urlCreateLimiterConfig);
export const urlRedirectRateLimit = createRateLimiterMiddleware(urlRedirectLimiterConfig);
export const profileUpdateRateLimit = createRateLimiterMiddleware(
  profileUpdateLimiterConfig,
);
export const sensitiveActionRateLimit = createRateLimiterMiddleware(
  sensitiveActionLimiterConfig,
);
