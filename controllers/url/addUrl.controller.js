import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';
import addUrlUseCase from '../../useCases/url/addUrl.useCase.js';

export async function addUrlController(req, res, next) {
  let userId = req.userId;
  try {
    const { url } = req.body;

    const shortUrl = await addUrlUseCase(userId, url);

    res.status(201).json({
      shortUrl,
      message: 'URL shortened successfully',
    });

    
    logActivityUseCase({
      actor: { userId, email: null },
      action: 'URL_CREATE',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId: userId, email: null },
      action: 'URL_CREATE',
      status: 'FAILED',
      failureReason: err,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default addUrlController;
