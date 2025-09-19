import { createFileRoute } from '@tanstack/react-router';

import { authClient } from '@/utils/authClient';
import { trpc } from '@/utils/trpc';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { data: session, isPending } = authClient.useSession();
  const { data } = trpc.hello.getProtected.useQuery({ name: 'World' }, { enabled: !!session?.session });

  if (isPending) {
    return <div>Loading...</div>;
  }

  return <p className="text-xl">Message: {data?.message} | User: {session?.user.email}</p>;
}
