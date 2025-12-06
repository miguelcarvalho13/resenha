import { Group, type GroupProps, Text } from '@mantine/core';

import { NavLinkStyled } from '@/components/link/NavLinkStyled';
import { type Search } from '@/models/searches';
import { SearchFavoriteButton } from '../SearchFavoriteButton';
import { SearchReadableText } from '../SearchReadableText';

interface NavbarSearchLinkProps extends GroupProps {
  search: Search;
}

export const NavbarSearchLink = ({
  search,
  ...props
}: NavbarSearchLinkProps) => (
  <Group data-testid="search-favorite" gap={0} wrap="nowrap" {...props}>
    <NavLinkStyled
      flex={1}
      to="/searches/{-$searchId}"
      label={
        <Text truncate="end">
          {search.name ? search.name : <SearchReadableText search={search} />}
        </Text>
      }
      params={{ searchId: search.id }}
      pr="xl"
    />
    <SearchFavoriteButton mr="sm" pos="absolute" right={0} search={search} />
  </Group>
);
