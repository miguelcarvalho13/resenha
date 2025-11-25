import { partition } from './utils/array';

export const utils = { partition };

export type { AppRouter } from './router';
export type { RouterInput, RouterOutput } from './trpc';
export {
  searchNotesSchema,
  type SearchNotesSchemaType,
} from './schemas/searches';
