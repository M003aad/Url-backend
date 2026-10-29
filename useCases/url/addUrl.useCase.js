import { addUrl, checkCodeExists } from '../../services/domain/url.service.js';
import generateRandomCodeForShortUrl from '../../utils/generateRandomCodeForShortUrl.util.js';
import env from '../../config/env.config.js';
import validateAndSanitizeUrl from '../../validators/url/validateUrl.util.js';
import AppError from '../../errors/appError.error.js';
import { cacheUrl } from '../../cache/url.cache.js';

export const addUrlUseCase = async (userId, url) => {
  const safeOriginalUrl = await validateAndSanitizeUrl(url);

  const length = Number(env.LENGTH_CODE) || 6;
  let code;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    code = await generateRandomCodeForShortUrl(length);
    const existing = await checkCodeExists(code);
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new AppError('Server is busy, please try again', 500, 'SERVER_ERROR');
  }

  const shortUrl = `${env.REDIRECT_URL}/r/${code}`;

  await addUrl({
    originalUrl: safeOriginalUrl,
    urlCode: code,
    shortUrl: shortUrl,
    userId: userId,
  });

  cacheUrl(code, safeOriginalUrl).catch((err) => {
    console.error(`Failed to pre-warm cache for code ${code}:`, err);
  });

  return shortUrl;
};

export default addUrlUseCase;
