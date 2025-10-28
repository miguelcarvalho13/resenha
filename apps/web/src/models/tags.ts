import { type ArrayElement } from '@/utils/types';
import { type RouterOutput } from '@/utils/trpc';

export type NoteTag = ArrayElement<
  RouterOutput['tags']['findAllNoteTags']['noteTags']
>;
