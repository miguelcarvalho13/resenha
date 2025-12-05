import { AppShell, Box, Burger, Group, Stack, Title } from '@mantine/core';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { NavLinkStyled } from '@/components/link/NavLinkStyled';
import { FavoritedSearchesLinks } from '@/components/search/FavoritedSearchesLinks';
import { SearchNotesButton } from '@/components/search/SearchNotesButton';
import UserMenu from '@/components/user/UserMenu';
import { useDisclosure } from '@mantine/hooks';

export const Route = createFileRoute('/_authenticated')({
  component: Index,
});

function Index() {
  const { t } = useTranslation();
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
        <Group h="100%">
          <Group h="100%" px="md" w={{ sm: 300 }}>
            <Burger
              aria-label={t(($) => $.menu.hamburger)}
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              aria-label={t(($) => $.menu.hamburger)}
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />

            <Title order={1}>{t(($) => $.common.appTitle)}</Title>
          </Group>
          <Group flex="1" justify="space-between" pr="md">
            <SearchNotesButton />
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md">
        <Stack h="100%" justify="space-between">
          <Stack gap={0}>
            <NavLinkStyled to="/home" label={t(($) => $.menu.recent)} />
            <NavLinkStyled to="/searches" label={t(($) => $.menu.mySearches)} />
          </Stack>
          <Box mx="sm" bd="1px dashed gray.2" />
          <Stack h="100%" justify="flex-start" px="sm">
            <FavoritedSearchesLinks />
          </Stack>
          <Stack gap={0}>
            <NavLinkStyled to="/trash" label={t(($) => $.menu.trash)} />
            <NavLinkStyled
              to="/config"
              label={t(($) => $.menu.configurations)}
            />
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
