import RESPONSE_MESSAGES from '../../constants/responseMessages.constant.js';
import SUCCESS_CODES from '../../constants/successCodes.constant.js';
import getProfileUseCase from '../../useCases/profile/getProfile.useCase.js';

export async function getProfileController(req, res, next) {
  try {
    const userId = req.userId;

    const profile = await getProfileUseCase(userId);

    res.status(201).json({
      profile,
      message: RESPONSE_MESSAGES[SUCCESS_CODES.GET_PROFILE],
    });
  } catch (err) {
    next(err);
  }
}

export default getProfileController;
