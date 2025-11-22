import { NO_OPTION_VALUE, YES_OPTION_VALUE, type Tag } from '@/models/tags';
import { type HomeSearchParams } from '@/routes/_authenticated/home';
import { type SearchModalSchemaType } from './SearchNotesModal.form';

/**
 * Used to get the the search params for index route given the search modal
 * state.
 */
export const fromSearchNotesSchemaToSearchParams = ({
  values,
  tags,
}: {
  values: SearchModalSchemaType;
  tags: Tag[];
}): HomeSearchParams => {
  const query: HomeSearchParams['query'] = values.query.map(
    ({ tagId, operator, value }) => {
      const tag = tags.find(({ id }) => id === tagId);

      if (!tag) {
        throw new Error('Selected tag not found');
      }

      switch (tag.type) {
        case 'string':
          return { tagId, type: tag.type, operator: { type: '=' } };
        case 'number':
          if (!operator || typeof value !== 'number') {
            throw new Error('Unreachable case');
          }

          return {
            tagId,
            type: tag.type,
            operator: { type: operator, value },
          };
        case 'date':
          if (!operator || typeof value !== 'string') {
            throw new Error('Unreachable case');
          }

          return {
            tagId,
            type: tag.type,
            operator: { type: operator, value },
          };
        case 'boolean':
          if (operator !== '=') {
            throw new Error('Unreachable case');
          }

          return {
            tagId,
            type: tag.type,
            operator: { type: operator, value: value === YES_OPTION_VALUE },
          };
        default:
          throw new Error('Unknown tag type');
      }
    },
  );

  return { query };
};

/**
 * Used to get the the modal state given the search params state.
 */
export const fromSearchParamsToSearchNotesSchema = ({
  values,
}: {
  values: HomeSearchParams;
}): SearchModalSchemaType => {
  const query: SearchModalSchemaType['query'] = (values.query ?? []).map(
    (q) => {
      switch (q.type) {
        case 'string':
          return {
            tagId: q.tagId,
            operator: q.operator.type,
            value: undefined,
          };
        case 'boolean':
          return {
            tagId: q.tagId,
            operator: q.operator.type,
            value: q.operator.value ? YES_OPTION_VALUE : NO_OPTION_VALUE,
          };
        case 'number':
        case 'date':
          return {
            tagId: q.tagId,
            operator: q.operator.type,
            value: q.operator.value,
          };
        default:
          throw new Error('Unknown tag type');
      }
    },
  );

  return { query };
};
