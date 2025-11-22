import { AppShell, Group, Space, Title } from '@mantine/core';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_public')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header>
        <Group h="100%" px="md">
          <Space h="sm" w="28px" />
          <Title order={1}>{t(($) => $.common.appTitle)}</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
