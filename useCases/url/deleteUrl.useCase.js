import { findUrlAndDeleteIt } from '../../services/domain/url.service.js';
import assertUrlExist from '../../utils/url/assertUrlExist.util.js';
import { invalidateUrlCache } from '../../cache/url.cache.js';

export const deleteUrlUseCase = async (urlId, userId) => {
  const deletedUrl = await findUrlAndDeleteIt(urlId, userId);
  assertUrlExist(deletedUrl);

  const code = deletedUrl.urlCode;

  await invalidateUrlCache(code);

  return null;
};

export default deleteUrlUseCase;
