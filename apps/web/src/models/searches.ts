import { type RouterInput, type RouterOutput } from '@/utils/trpc';
import { type ArrayElement } from '@/utils/types';

export type SearchOperators = ArrayElement<
  RouterInput['searches']['searchNotes']['query']
>['operator']['type'];

export type Search = ArrayElement<
  RouterOutput['searches']['findAllSearches']['searches']
>;
