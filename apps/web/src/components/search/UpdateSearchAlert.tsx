import { Alert, Button, Stack, Text } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearch } from '@tanstack/react-router';
import { isEqual } from 'es-toolkit';
import { useTranslation } from 'react-i18next';
import { TbEdit } from 'react-icons/tb';

import { Route as SearchRoute } from '@/routes/_authenticated/searches.{-$searchId}';
import { useTRPC } from '@/utils/trpc';

export const UpdateSearchAlert = () => {
  const { t } = useTranslation();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { query } = useSearch({ from: SearchRoute.id });
  const { searchId } = useParams({ from: SearchRoute.id });
  const navigate = SearchRoute.useNavigate();
  const { mutate: editSearch } = useMutation(
    trpc.searches.editSearch.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(
          trpc.searches.findAllSearches.pathFilter(),
        );
        void queryClient.invalidateQueries(
          trpc.searches.findSearchById.pathFilter(),
        );
        void navigate({ to: '.' });
      },
    }),
  );

  const { data: searchData, isLoading } = useQuery({
    ...trpc.searches.findSearchById.queryOptions({
      searchId: searchId ?? '',
    }),
    enabled: !!searchId,
  });

  const handleOnClick = () => {
    if (searchId) {
      editSearch({ id: searchId, content: { query: query ?? [] } });
    }
  };

  if (
    isLoading ||
    !query?.length ||
    isEqual(query, searchData?.search?.content.query)
  ) {
    return null;
  }

  return (
    <Alert
      icon={<TbEdit />}
      title={t(($) => $.search.updateSearchAlert.title)}
      variant="light"
    >
      <Stack align="end">
        <Text w="100%">{t(($) => $.search.updateSearchAlert.body)}</Text>
        <Button className="justify-self-end" onClick={handleOnClick}>
          {t(($) => $.search.updateSearchAlert.button)}
        </Button>
      </Stack>
    </Alert>
  );
};
