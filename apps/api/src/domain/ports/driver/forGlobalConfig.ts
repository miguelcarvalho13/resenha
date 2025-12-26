import type { DrivenContext } from '@api/domain/context';
import type { GlobalConfig } from '@api/domain/entities/globalConfig';

export type ForGlobalConfigDriverPort = (
  ctx: Pick<DrivenContext, 'forGlobalConfig'>,
) => {
  findAll: () => Promise<GlobalConfig>;
};
