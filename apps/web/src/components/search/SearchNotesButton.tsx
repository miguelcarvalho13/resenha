import { Button, Text } from '@mantine/core';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TbZoom } from 'react-icons/tb';

import { Route as RouteIndex } from '@/routes/index';
import { modals } from '@mantine/modals';
import { SearchNotesModal } from './searchNotesModal/SearchNotesModal';
import {
  fromSearchNotesSchemaToSearchParams,
  fromSearchParamsToSearchNotesSchema,
} from './searchNotesModal/SearchNotesModal.utils';
import { trpc } from '@/utils/trpc';

export const SearchNotesButton = () => {
  const { t } = useTranslation();
  const searchParams = useSearch({
    from: RouteIndex.fullPath,
    shouldThrow: false,
  });
  const navigate = useNavigate({ from: RouteIndex.fullPath });
  const { data: tagsData } = trpc.tags.findAllTags.useQuery();

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
                  void navigate({
                    search: fromSearchNotesSchemaToSearchParams({
                      values,
                      tags: tagsData?.tags ?? [],
                    }),
                  });
                }}
              />
            ),
          })
        }
        variant="transparent"
      >
        <Text c="dimmed" visibleFrom="xs">
          {t(($) => $.search.searchNotes)}
        </Text>
      </Button>
    </>
  );
};
