import { Button, Text } from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TbZoom } from 'react-icons/tb';

import { Route as HomeRoute } from '@/routes/_authenticated/home';
import { useTRPC } from '@/utils/trpc';
import { modals } from '@mantine/modals';
import { SearchNotesModal } from './searchNotesModal/SearchNotesModal';
import {
  fromSearchNotesSchemaToSearchParams,
  fromSearchParamsToSearchNotesSchema,
} from './searchNotesModal/SearchNotesModal.utils';
import { SearchReadableText } from './SearchReadableText';

export const SearchNotesButton = () => {
  const trpc = useTRPC();
  const { t } = useTranslation();
  const searchParams = useSearch({
    from: HomeRoute.id,
    shouldThrow: false,
  });
  const navigate = useNavigate({ from: HomeRoute.fullPath });
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
                  values: { query: searchParams?.query ?? [] },
                })}
                onClearSearch={() => navigate({})}
                onSubmit={(values) => {
                  const search = fromSearchNotesSchemaToSearchParams({
                    values,
                    tags: tagsData?.tags ?? [],
                  });

                  if (search.query) {
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
        {searchParams?.query ? (
          <Text c="dark" visibleFrom="xs" truncate="end">
            <SearchReadableText
              search={{ content: { query: searchParams.query } }}
            />
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
