import AppError from '../../errors/appError.error.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';
import getOriginalUrlByCodeUseCase from '../../useCases/url/getOriginalUrlByCode.useCase.js';

export async function getOriginalUrlByCodeController(req, res, next) {
  try {
    const code = req.params.code;
    const originalUrl = await getOriginalUrlByCodeUseCase(code);

    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.redirect(302, originalUrl);

    logActivityUseCase({
      actor: { userId : null, email: null },
      action: 'URL_REDIRECT',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId: null, email: null },
      action: 'URL_REDIRECT',
      status: 'FAILED',
      failureReason: err,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default getOriginalUrlByCodeController;
