import {
  findOriginalUrlByCode,
  incrementClickCount,
} from '../../services/domain/url.service.js';
import assertExistCode from '../../utils/assertExitCode.util.js';
import { localUrlCache } from '../../cache/url.cache.js';

export const getOriginalUrlByCodeUseCase = async (code) => {

  let originalUrl = localUrlCache.get(code);
  if (!originalUrl) {
    // 2. Cache Miss: Fetch from MongoDB Atlas (~78ms)
    const urlDoc = await findOriginalUrlByCode(code);
    assertExistCode(urlDoc);

    originalUrl = urlDoc.originalUrl;
    urlCache.set(code, originalUrl);
  }
  incrementClickCount(code).catch(() => {});

  return urlDoc.originalUrl;
};

export default getOriginalUrlByCodeUseCase;
