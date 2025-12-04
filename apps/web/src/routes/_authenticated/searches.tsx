import { Stack } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import { AllSearchesGrid } from '@/components/search/AllSearchesGrid';

export const Route = createFileRoute('/_authenticated/searches')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Stack p="xl">
      <AllSearchesGrid />
    </Stack>
  );
}
