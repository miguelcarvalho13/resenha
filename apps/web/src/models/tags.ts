import { type ArrayElement } from '@/utils/types';
import { type RouterOutput } from '@/utils/trpc';

export type NoteTag = ArrayElement<
  RouterOutput['tags']['findAllNoteTags']['noteTags']
>;

export type Tag = ArrayElement<RouterOutput['tags']['findAllTags']['tags']>;
