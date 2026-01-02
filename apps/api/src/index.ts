import { partition } from './utils/array';

export const utils = { partition };

export type { AppRouter } from './adapters/driver/trpc';
export type { RouterInput, RouterOutput } from './trpc';
export {
  searchNotesSchema,
  type SearchNotesSchemaType,
} from './adapters/driver/trpc/forSearchesTrpcInput';
