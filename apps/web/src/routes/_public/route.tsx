import { AppShell, Group, Space, Title } from '@mantine/core';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_public')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header>
        <Group h="100%" px="md">
          <Space h="sm" w="28px" />
          <Title order={1}>Resenhaí</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
