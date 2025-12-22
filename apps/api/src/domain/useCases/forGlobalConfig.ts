import type { ForGlobalConfigDriverPort } from '@api/domain/ports/driver/forGlobalConfig';

export const forGlobalConfigUseCase: ForGlobalConfigDriverPort = ({
  forGlobalConfig,
}) => ({
  findAll: () => forGlobalConfig.findAll(),
});
