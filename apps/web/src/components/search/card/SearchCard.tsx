import { Group, Paper, Stack, Text } from '@mantine/core';

import { type Search } from '@/models/searches';
import { SearchReadableText } from '../SearchReadableText';
import { SearchCardDeleteButton } from './SearchCardDeleteButton';
import { SearchFavoriteButton } from '../SearchFavoriteButton';
import { SearchNameField } from '../SearchNameField';

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

      <Text className="line-clamp-2">
        <SearchReadableText search={search} />
      </Text>

      <Group gap="xs" justify="end">
        <SearchCardDeleteButton search={search} />
      </Group>
    </Stack>
  </Paper>
);
