import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';
// import getProfileUseCase from '../../useCases/profile/getProfile.useCase.js';

export async function getProfileController(req, res, next) {
  let { firstName, lastName, email } = req.user;
  let userId = req.userId
  try {
    const profile = { firstName, lastName, email };
    res.status(201).json({
      profile,
      message: RESPONSE_MESSAGES[SUCCESS_CODES.GET_PROFILE],
    });

    logActivityUseCase({
      actor: { userId, email },
      action: 'USER_GET_PROFILE',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId: userId, email: email },
      action: 'USER_GET_PROFILE',
      status: 'FAILED',
      failureReason: err,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default getProfileController;
