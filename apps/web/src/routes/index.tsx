import { createFileRoute, redirect } from '@tanstack/react-router';

import { authClient } from '@/utils/authClient';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (!session?.session) {
      throw redirect({
        to: '/sign-in',
      });
    }

    return redirect({ to: '/home' });
  },
});
