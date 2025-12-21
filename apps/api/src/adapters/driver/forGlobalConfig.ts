import type { ForGlobalConfigDriverPort } from '@api/domain/ports/driver/forGlobalConfig';

export const ForGlobalConfigDriverAdapter: ForGlobalConfigDriverPort = ({
  forGlobalConfig,
}) => ({
  findAll: () => forGlobalConfig.findAll(),
});
