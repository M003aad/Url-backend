import { rateLimit } from 'express-rate-limit';
import createUpstashStore from './redis.config.js';
import AppError from '../errors/appError.error.js';
import ERROR_CODES from '../constants/errorCodes.constant.js';
import { RESPONSE_MESSAGES } from '../constants/responseMessages.constant.js';

const rateLimitHandler = (customErrorCode) => (req, res, next) => {
  const userFriendlyMessage =
    RESPONSE_MESSAGES[customErrorCode] || 'Too many requests. Please slow down.';
  return next(new AppError(userFriendlyMessage, 429, customErrorCode));
};

export const globalLimiterConfig = {
  store: createUpstashStore('ratelimit:global:', 1 * 60),
  windowMs: 1 * 60 * 1000,
  limit: 100, // 100 requests per minute
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  errorCode: ERROR_CODES.RATELIMIT_GLOBAL,
};

export const authLimiterConfig = {
  store: createUpstashStore('ratelimit:auth:', 15 * 60),
  windowMs: 15 * 60 * 1000,
  limit: 5, // 5 login attempts per 15 mins
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  errorCode: ERROR_CODES.RATELIMIT_LOGIN,
};

export const registerLimiterConfig = {
  store: createUpstashStore('ratelimit:register:', 60 * 60),
  windowMs: 60 * 60 * 1000,
  limit: 3, // 3 registrations per hour
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  errorCode: ERROR_CODES.RATELIMIT_REGISTER,
};

export const emailSpamLimiterConfig = {
  store: createUpstashStore('ratelimit:email:', 5 * 60),
  windowMs: 5 * 60 * 1000,
  limit: 2, // 2 emails per 5 mins
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  errorCode: ERROR_CODES.RATELIMIT_EMAIL,
};

// ... existing imports ...

// URL Limiters
export const urlCreateLimiterConfig = {
  store: createUpstashStore('ratelimit:url_create:', 1 * 60),
  windowMs: 1 * 60 * 1000,
  limit: 10, // 10 new short URLs created per minute
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  errorCode: ERROR_CODES.RATELIMIT_URL_CREATE || ERROR_CODES.RATELIMIT,
};

export const urlRedirectLimiterConfig = {
  store: createUpstashStore('ratelimit:url_redirect:', 1 * 60),
  windowMs: 1 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  errorCode: ERROR_CODES.RATELIMIT_URL_REDIRECT || ERROR_CODES.RATELIMIT,
};

// Profile & Password Security Limiters
export const profileUpdateLimiterConfig = {
  store: createUpstashStore('ratelimit:profile_update:', 15 * 60),
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  errorCode: ERROR_CODES.RATELIMIT_PROFILE_UPDATE || ERROR_CODES.RATELIMIT,
};

export const sensitiveActionLimiterConfig = {
  store: createUpstashStore('ratelimit:sensitive:', 15 * 60),
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  errorCode: ERROR_CODES.RATELIMIT_SENSITIVE || ERROR_CODES.RATELIMIT,
};

export const globalLimiter = rateLimit({
  ...globalLimiterConfig,
  handler: rateLimitHandler(globalLimiterConfig.errorCode),
});
