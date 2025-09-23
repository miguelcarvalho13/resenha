import { createFileRoute, redirect } from '@tanstack/react-router';

import { LogoutButton } from '@/components/auth/LogoutButton';
import { authClient } from '@/utils/authClient';
import { trpc } from '@/utils/trpc';

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
  const { data: session, isPending } = authClient.useSession();
  const { data } = trpc.hello.getProtected.useQuery(
    { name: 'World' },
    { enabled: !!session?.session },
  );

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p className="text-xl">
        Message: {data?.message} | User: {session?.user.email}
      </p>
      <LogoutButton />
    </div>
  );
}
