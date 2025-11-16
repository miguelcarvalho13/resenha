import { type ArrayElement } from '@/utils/types';
import { type RouterOutput } from '@/utils/trpc';

export type NoteTag = ArrayElement<
  RouterOutput['tags']['findAllNoteTags']['noteTags']
>;

export type Tag = ArrayElement<RouterOutput['tags']['findAllTags']['tags']>;

export const NO_OPTION_VALUE = 'NO';
export const YES_OPTION_VALUE = 'YES';
export const SELECT_OPTION_VALUES = [
  YES_OPTION_VALUE,
  NO_OPTION_VALUE,
] as const;
