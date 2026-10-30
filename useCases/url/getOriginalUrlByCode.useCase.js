import {
  findOriginalUrlByCode,
  incrementClickCount,
} from '../../services/domain/url.service.js';
import assertExistCode from '../../utils/assertExitCode.util.js';
import { localUrlCache } from '../../cache/url.cache.js';

export const getOriginalUrlByCodeUseCase = async (code) => {
  // fetch value by code in memory cache 
  let originalUrl = localUrlCache.get(code);
  if (!originalUrl) {
    //  Cache Miss: Fetch from MongoDB Atlas (78ms)
    const urlDoc = await findOriginalUrlByCode(code);
    assertExistCode(urlDoc);

    originalUrl = urlDoc.originalUrl;
    // code : key  / originalUrl : value
    localUrlCache.set(code, originalUrl);
  }; 

  incrementClickCount(code).catch(() => {});

  return originalUrl;
};

export default getOriginalUrlByCodeUseCase;
