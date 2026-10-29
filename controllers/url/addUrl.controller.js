import addUrlUseCase from '../../useCases/url/addUrl.useCase.js';

export async function addUrlController(req, res, next) {
  try {
    const userId = req.userId;
    const { url } = req.body;

    const shortUrl = await addUrlUseCase(userId, url);

    return res.status(201).json({
      shortUrl,
      message: 'URL shortened successfully',
    });
  } catch (err) {
    next(err);
  }
}

export default addUrlController;
