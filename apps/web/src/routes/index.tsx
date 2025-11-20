import { Stack, Text } from '@mantine/core';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useTranslation } from 'react-i18next';
import z from 'zod';

import CreateNoteButton from '@/components/note/CreateNoteButton';
import { RecentNotesGrid } from '@/components/note/RecentNotesGrid';
import { SearchedNotesGrid } from '@/components/note/SearchedNotesGrid';
import { authClient } from '@/utils/authClient';
import { searchNotesSchema } from '@repo/api';

const indexSearchSchema = z.object({
  query: z.array(searchNotesSchema().shape.query.unwrap()).nullish(),
});

export type IndexSearchParams = z.infer<typeof indexSearchSchema>;

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
  validateSearch: zodValidator(indexSearchSchema),
});

function Index() {
  const { t } = useTranslation();
  const { data: session, isPending } = authClient.useSession();
  const { query } = Route.useSearch();

  if (isPending) {
    return <div>{t(($) => $.common.loading)}</div>;
  }

  return (
    <div>
      <Stack p="xl">
        <Text>User: {session?.user?.email}</Text>
        <CreateNoteButton />
        {query?.length ? <SearchedNotesGrid /> : <RecentNotesGrid />}
      </Stack>
    </div>
  );
}
