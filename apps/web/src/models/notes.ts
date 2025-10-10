import { type ArrayElement } from '@/utils/types';
import { type RouterOutput } from '@api/trpc';

export type NoteForFindAll = ArrayElement<
  RouterOutput['notes']['findAll']['notes']
>;
