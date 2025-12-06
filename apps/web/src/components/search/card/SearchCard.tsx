import { Group, Paper, Stack, Text } from '@mantine/core';

import { LinkStyled } from '@/components/link/LinkStyled';
import { type Search } from '@/models/searches';
import { SearchFavoriteButton } from '../SearchFavoriteButton';
import { SearchNameField } from '../SearchNameField';
import { SearchReadableText } from '../SearchReadableText';
import { SearchCardDeleteButton } from './SearchCardDeleteButton';

interface SearchCardProps {
  search: Search;
}

export const SearchCard = ({ search }: SearchCardProps) => (
  <Paper data-testid="search-card" shadow="xs" p="md">
    <Stack h="100%" justify="space-between">
      <Group gap="xs" justify="space-between" wrap="nowrap">
        <SearchNameField flex={1} search={search} />
        <SearchFavoriteButton search={search} />
      </Group>

      <LinkStyled to="/searches/{-$searchId}" params={{ searchId: search.id }}>
        <Text className="line-clamp-2">
          <SearchReadableText search={search} />
        </Text>
      </LinkStyled>

      <Group gap="xs" justify="end">
        <SearchCardDeleteButton search={search} />
      </Group>
    </Stack>
  </Paper>
);
