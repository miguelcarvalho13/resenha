import { Stack } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { AllSearchesGrid } from '@/components/search/AllSearchesGrid';
import { useTRPC } from '@/utils/trpc';
import { SearchedNotesGrid } from '@/components/note/SearchedNotesGrid';

export const Route = createFileRoute('/_authenticated/searches/{-$searchId}')({
  component: RouteComponent,

  loader: async ({ context: { queryClient, trpc }, params }) => {
    if (params.searchId) {
      await queryClient.ensureQueryData(
        trpc.searches.findSearchById.queryOptions({
          searchId: params.searchId,
        }),
      );
    }
  },
});

function RouteComponent() {
  const { searchId } = Route.useParams();
  const trpc = useTRPC();
  const { data: searchData } = useQuery({
    ...trpc.searches.findSearchById.queryOptions({ searchId: searchId! }),
    enabled: !!searchId,
  });

  return (
    <Stack p="xl">
      {searchId ? (
        <SearchedNotesGrid search={searchData?.search} />
      ) : (
        <AllSearchesGrid />
      )}
    </Stack>
  );
}
