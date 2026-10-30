import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import updateProfileUseCase from '../../useCases/profile/updateProfile.useCase.js';

export async function updateProfileController(req, res, next) {
  try {
    const user = req.user;
    const { firstName, lastName } = req.body;
    const data = { user, firstName, lastName };
    const profile = await updateProfileUseCase(data);

    res.status(201).json({
      profile,
      message: RESPONSE_MESSAGES[SUCCESS_CODES.UPDATE_PROFILE],
    });
  } catch (err) {
    next(err);
  }
}

export default updateProfileController;
