import deleteUrlUseCase from '../../useCases/url/deleteUrl.useCase.js';

export async function deleteUrlController(req, res, next) {
  try {
    const urlId = req.params.urlId;
    const userId = req.userId;
    await deleteUrlUseCase(urlId, userId);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export default deleteUrlController;
