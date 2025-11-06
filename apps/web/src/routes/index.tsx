import { Stack, Text } from '@mantine/core';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import CreateNoteButton from '@/components/note/CreateNoteButton';
import { RecentNotesGrid } from '@/components/note/RecentNotesGrid';
import { authClient } from '@/utils/authClient';

export const Route = createFileRoute('/')({
  component: Index,
  loader: async () => {
    const { data: session } = await authClient.getSession();

    if (!session?.session) {
      throw redirect({
        to: '/sign-in',
      });
    }
  },
});

function Index() {
  const { t } = useTranslation();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div>{t(($) => $.common.loading)}</div>;
  }

  return (
    <div>
      <Stack p="xl">
        <Text>User: {session?.user?.email}</Text>
        <CreateNoteButton />
        <RecentNotesGrid />
      </Stack>
    </div>
  );
}
