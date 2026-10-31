import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import logActivityUseCase from '../../useCases/audit/logActivity.useCase.js';
import updateProfileUseCase from '../../useCases/profile/updateProfile.useCase.js';

export async function updateProfileController(req, res, next) {
  let user = req.user;
  let userId = req.userId;
  try {
    const { firstName, lastName } = req.body;
    const data = { user, firstName, lastName };
    const profile = await updateProfileUseCase(data);

    res.status(201).json({
      profile,
      message: RESPONSE_MESSAGES[SUCCESS_CODES.UPDATE_PROFILE],
    });

    logActivityUseCase({
      actor: { userId, email:null },
      action: 'USER_UPDATE_PROFILE',
      status: 'SUCCESS',
      context: req.userMetadata,
    });

  } catch (err) {

    logActivityUseCase({
      actor: { userId: userId, email: null },
      action: 'USER_UPDATE_PROFILE',
      status: 'FAILED',
      failureReason: err,
      context: req.userMetadata,
    });

    next(err);
  }
}

export default updateProfileController;
