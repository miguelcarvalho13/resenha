import type { GlobalConfig } from '@api/domain/entities/globalConfig';

export type ForGlobalConfigDrivenPort = {
  findAll: () => Promise<GlobalConfig>;
};
