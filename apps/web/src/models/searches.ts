import { type RouterInput } from '@/utils/trpc';
import { type ArrayElement } from '@/utils/types';

export type SearchOperators = ArrayElement<
  RouterInput['searches']['searchNotes']['query']
>['operator']['type'];
