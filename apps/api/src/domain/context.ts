import type { ForGlobalConfigDrivenPort } from '@api/domain/ports/driven/forGlobalConfig';
import type { ForGlobalConfigDriverPort } from './ports/driver/forGlobalConfig';

export type DrivenContext = {
  forGlobalConfig: ForGlobalConfigDrivenPort;
};

export type DriverContext = {
  forGlobalConfig: ReturnType<ForGlobalConfigDriverPort>;
};
