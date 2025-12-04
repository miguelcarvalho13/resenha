import { Paper, Stack, Text } from '@mantine/core';

import { type Search } from '@/models/searches';
import { SearchReadableText } from '../SearchReadableText';

interface SearchCardProps {
  search: Search;
}

export const SearchCard = ({ search }: SearchCardProps) => (
  <Paper data-testid="search-card" shadow="xs" p="xl">
    <Stack h="100%" justify="space-between">
      <Text className="line-clamp-2">
        <SearchReadableText search={search} />
      </Text>
    </Stack>
  </Paper>
);
