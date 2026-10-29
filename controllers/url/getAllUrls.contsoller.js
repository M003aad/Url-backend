import getAllUrlsUseCase from '../../useCases/url/getAllUrls.useCase.js';

export async function getAllUrlsController(req, res, next) {
  try {
    const userId = req.userId;
    const page = req.query.page;

    const result = await getAllUrlsUseCase(userId, page);

    return res.status(200).json({
      results: result.urls.length,
      urls: result.urls,
      pagination: {
        totalUrls: result.totalUrls,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        hasNextPage: result.currentPage < result.totalPages,
        hasPrevPage: result.currentPage > 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

export default getAllUrlsController;
