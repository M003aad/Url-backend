import AppError from '../../errors/appError.error.js';
import getOriginalUrlByCodeUseCase from '../../useCases/url/getOriginalUrlByCode.useCase.js';

export async function getOriginalUrlByCodeController(req, res, next) {
  try {
    const code = req.params.code;
    const originalUrl = await getOriginalUrlByCodeUseCase(code);

    const parsedUrl = new URL(originalUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new AppError('Invalid or unsafe URL protocol', 400, 'INVALID_URL');
    }

    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.redirect(302, originalUrl);
  } catch (err) {
    next(err);
  }
}

export default getOriginalUrlByCodeController;
