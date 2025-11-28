import { Stack } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import { SoftDeletedNotesGrid } from '@/components/note/SoftDeletedNotesGrid';

export const Route = createFileRoute('/_authenticated/trash')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Stack p="xl">
      <SoftDeletedNotesGrid />
    </Stack>
  );
}
