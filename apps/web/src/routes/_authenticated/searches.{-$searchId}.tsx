import { Stack } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import { AllSearchesGrid } from '@/components/search/AllSearchesGrid';

export const Route = createFileRoute('/_authenticated/searches/{-$searchId}')({
  component: RouteComponent,
});

function RouteComponent() {
  const { searchId } = Route.useParams();

  return (
    <Stack p="xl">
      {searchId ? `/searches/${searchId}` : <AllSearchesGrid />}
    </Stack>
  );
}
