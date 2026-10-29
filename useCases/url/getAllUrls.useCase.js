import { getAllUrls } from '../../services/domain/url.service.js';

export const getAllUrlsUseCase = async (userId, page = 1) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const LIMIT = 5;

  return await getAllUrls(userId, parsedPage, LIMIT);
};

export default getAllUrlsUseCase;
