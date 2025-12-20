import type { GlobalConfigFindAllPort } from '@api/domain/ports/driven/globalConfig';

const findAll: GlobalConfigFindAllPort = async () => {
  const isEmailSignupEnabled =
    process.env.FEATURE_ENABLE_EMAIL_SIGNUP === '1' ||
    process.env.FEATURE_ENABLE_EMAIL_SIGNUP?.toLocaleLowerCase() === 'true';

  const isInviteCodesEnabled =
    process.env.FEATURE_ENABLE_INVITES === '1' ||
    process.env.FEATURE_ENABLE_INVITES?.toLocaleLowerCase() === 'true';

  return {
    isEmailSignupEnabled,
    isInviteCodesEnabled,
  };
};

export default {
  findAll,
};
