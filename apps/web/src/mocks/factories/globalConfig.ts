import {
  globalConfigMock,
  type GlobalConfigMockSchemaType,
} from '@/mocks/models/globalConfig';
import type { GlobalConfig } from '@/models/globalConfig';

export const createGlobalConfig = (
  data: Partial<GlobalConfig> = {},
): GlobalConfig => ({
  isEmailSignupEnabled: true,
  isInviteCodesEnabled: false,
  ...data,
});

export const createGlobalConfigMock = async ({
  ...data
}: Partial<GlobalConfigMockSchemaType> = {}) =>
  globalConfigMock.create({
    ...createGlobalConfig(data),
  });
