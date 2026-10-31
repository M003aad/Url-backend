import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';
import getAllUrlsUseCase from '../../useCases/url/getAllUrls.useCase.js';

export async function getAllUrlsController(req, res, next) {
  let userId = req.userId;
  try {
    const page = req.query.page;

    const result = await getAllUrlsUseCase(userId, page);

    res.status(200).json({
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

    logActivityUseCase({
      actor: { userId, email: null },
      action: 'URL_GET_ALL_URL',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId, email: null },
      action: 'URL_GET_ALL_URL',
      status: 'FAILED',
      failureReason: err,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default getAllUrlsController;
