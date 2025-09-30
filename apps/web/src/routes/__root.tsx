import { AppShell, Burger, Group, Stack, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createRootRoute, Outlet } from '@tanstack/react-router';

import { NavLinkStyled } from '@/components/link/NavLinkStyled';
import UserMenu from '@/components/user/UserMenu';

export const Route = createRootRoute({
  component: RootRoute,
});

function RootRoute() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group h="100%">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />

            <Title order={1}>Resenhaí</Title>
          </Group>

          <UserMenu />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md">
        <Stack justify="space-between" h="100%">
          <Stack gap={0}>
            <NavLinkStyled to="/" label="Recent" />
            <NavLinkStyled to="/searches" label="My Searches" />
          </Stack>
          <Stack gap={0}>
            <NavLinkStyled to="/trash" label="Trash" />
            <NavLinkStyled to="/config" label="Configurations" />
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
