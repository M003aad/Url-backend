import { findUrlAndDeleteIt } from '../../services/domain/url.service.js';
import assertUrlExist from '../../utils/url/assertUrlExist.util.js';
import { localUrlCache } from '../../cache/url.cache.js';

export const deleteUrlUseCase = async (urlId, userId) => {

  const deletedUrl = await findUrlAndDeleteIt(urlId, userId);
  assertUrlExist(deletedUrl);

  if (deletedUrl?.urlCode) {
    localUrlCache.delete(deletedUrl.urlCode);
  };

  return;
};

export default deleteUrlUseCase;
