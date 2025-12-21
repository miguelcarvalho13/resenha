import type { GlobalConfig } from '@api/domain/globalConfig';

export type ForGlobalConfigDrivenPort = {
  findAll: () => Promise<GlobalConfig>;
};
