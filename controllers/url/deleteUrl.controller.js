import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';
import deleteUrlUseCase from '../../useCases/url/deleteUrl.useCase.js';

export async function deleteUrlController(req, res, next) {
  let userId = req.userId
  try {
    const urlId = req.params.urlId;
    const userId = req.userId;
    await deleteUrlUseCase(urlId, userId);

    res.status(204).send();

    logActivityUseCase({
      actor: { userId, email: null },
      action: 'URL_DELETE',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId, email: null },
      action: 'URL_DELETE',
      status: 'FAILED',
      failureReason: err.code,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default deleteUrlController;
