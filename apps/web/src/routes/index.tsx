import { createFileRoute } from '@tanstack/react-router';

import { trpc } from '@/utils/trpc';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { data } = trpc.hello.getProtected.useQuery({ name: 'World' });

  return <p className="text-xl">Message: {data?.message}</p>;
}
