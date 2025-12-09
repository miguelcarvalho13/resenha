import { Stack } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import z from 'zod';

import { SearchedNotesGrid } from '@/components/note/SearchedNotesGrid';
import { AllSearchesGrid } from '@/components/search/AllSearchesGrid';
import { searchNotesSchema } from '@repo/api';

const searchSearchSchema = z.object({
  query: z.array(searchNotesSchema().shape.query.unwrap()).nullish(),
});

export type SearchSearchParams = z.infer<typeof searchSearchSchema>;

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

  validateSearch: zodValidator(searchSearchSchema),
});

function RouteComponent() {
  const { searchId } = Route.useParams();

  return (
    <Stack p="xl">
      {searchId ? <SearchedNotesGrid /> : <AllSearchesGrid />}
    </Stack>
  );
}
