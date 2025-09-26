import { AppShell, Group, Title } from '@mantine/core';
import { createRootRoute, Outlet } from '@tanstack/react-router';

import UserMenu from '@/components/user/UserMenu';

export const Route = createRootRoute({
  component: RootRoute,
});

function RootRoute() {
  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={1}>Resenhaí</Title>
          <UserMenu />
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
