import { addUrl } from '../../services/domain/url.service.js';
import generateRandomCodeForShortUrl from '../../utils/generateRandomCodeForShortUrl.util.js';
import env from '../../config/env.config.js';
import validateAndSanitizeUrl from '../../validators/url/validateUrl.util.js';
import AppError from '../../errors/appError.error.js';

export const addUrlUseCase = async (userId, url) => {
  const safeOriginalUrl = await validateAndSanitizeUrl(url);

  const length = Number(env.LENGTH_CODE) || 4;

  try {
    const code = generateRandomCodeForShortUrl(length);
    const shortUrl = `${env.REDIRECT_URL}/r/${code}`;

    await addUrl({
      originalUrl: safeOriginalUrl,
      urlCode: code,
      shortUrl,
      userId,
    });

    return shortUrl;
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('URL code collision, please try again', 409, 'URL_EXISTS');
    }
    throw error;
  }
};

export default addUrlUseCase;