import { searchNotesSchema } from '@repo/api';

export const getCurrentQueryFromUrl = () => {
  const queryString = new URLSearchParams(window.location.search).get('query');

  if (!queryString) return [];

  return searchNotesSchema().shape.query.parse(
    JSON.parse(decodeURIComponent(queryString)),
  );
};
