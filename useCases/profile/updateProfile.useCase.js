import { updateProfile } from '../../services/domain/profile.service.js';

export const updateProfileUseCase = async (data) => {
  const { firstName, lastName, user } = data;
  if (user.firstName === firstName && user.lastName === lastName) {
    return;
  }
  const profile = await updateProfile(user.id, firstName, lastName);

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
  };
};

export default updateProfileUseCase;
