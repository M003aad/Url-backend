import {
  findOriginalUrlByCode,
  incrementClickCount,
} from '../../services/domain/url.service.js';
import assertExistCode from '../../utils/assertExitCode.util.js';
import { getCachedUrl, cacheUrl } from '../../cache/url.cache.js';

export const getOriginalUrlByCodeUseCase = async (code) => {
  // 1. Try cache hit (L1 or L2)
  const cachedUrl = await getCachedUrl(code);
  if (cachedUrl) {
    incrementClickCount(code).catch(() => {});
    return cachedUrl;
  }

  // 2. Fall back to DB
  const urlDoc = await findOriginalUrlByCode(code);
  assertExistCode(urlDoc);

  // 3. Cache the result
  await cacheUrl(code, urlDoc.originalUrl);

  incrementClickCount(code).catch(() => {});

  return urlDoc.originalUrl;
};

export default getOriginalUrlByCodeUseCase;