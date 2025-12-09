import { Button, Text } from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TbZoom } from 'react-icons/tb';

import { Route as HomeRoute } from '@/routes/_authenticated/home';
import { Route as SearchRoute } from '@/routes/_authenticated/searches.{-$searchId}';
import { useTRPC } from '@/utils/trpc';
import { modals } from '@mantine/modals';
import { SearchNotesModal } from './searchNotesModal/SearchNotesModal';
import {
  fromSearchNotesSchemaToSearchParams,
  fromSearchParamsToSearchNotesSchema,
} from './searchNotesModal/SearchNotesModal.utils';
import { SearchReadableText } from './SearchReadableText';
import { useCurrentSearch } from './useCurrentSearch';

export const SearchNotesButton = () => {
  const trpc = useTRPC();
  const { t } = useTranslation();

  const searchesParams = useParams({
    from: SearchRoute.id,
    shouldThrow: false,
  });

  const isOnSearchSubroute = !!searchesParams?.searchId?.length;

  const navigate = useNavigate({
    from: isOnSearchSubroute ? SearchRoute.fullPath : HomeRoute.fullPath,
  });

  const currentSearch = useCurrentSearch();
  const { data: tagsData } = useQuery(trpc.tags.findAllTags.queryOptions());
  const { mutate: recordSearch } = useMutation(
    trpc.searches.createSearch.mutationOptions(),
  );

  return (
    <>
      <Button
        aria-label={t(($) => $.search.searchNotes)}
        bd={{ xs: '1px solid var(--mantine-color-default-border)' }}
        flex={{ xs: 1 }}
        justify="start"
        leftSection={<TbZoom />}
        maw={{ xs: 250 }}
        onClick={() =>
          modals.open({
            title: t(($) => $.search.searchNotes),
            size: 'lg',
            children: (
              <SearchNotesModal
                initialValues={fromSearchParamsToSearchNotesSchema({
                  values: currentSearch,
                })}
                onClearSearch={() => navigate({})}
                onSubmit={(values) => {
                  const search = fromSearchNotesSchemaToSearchParams({
                    values,
                    tags: tagsData?.tags ?? [],
                  });

                  // Only saves the search if it's not at /searches/id
                  if (search.query && !isOnSearchSubroute) {
                    recordSearch({
                      content: {
                        query: search.query,
                      },
                    });
                  }
                  void navigate({ search });
                }}
              />
            ),
          })
        }
        variant="transparent"
      >
        {currentSearch.query.length ? (
          <Text c="dark" visibleFrom="xs" truncate="end">
            <SearchReadableText search={{ content: currentSearch }} />
          </Text>
        ) : (
          <Text c="dimmed" visibleFrom="xs">
            {t(($) => $.search.searchNotes)}
          </Text>
        )}
      </Button>
    </>
  );
};
