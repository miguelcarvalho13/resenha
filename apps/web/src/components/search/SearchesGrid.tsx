import { SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { type Search } from '@/models/searches';
import { SearchCard } from './card/SearchCard';

interface SearchesGridProps {
  searches: Search[] | undefined;
}

export const SearchesGrid = ({ searches }: SearchesGridProps) => {
  const { t } = useTranslation();

  if (!searches) {
    return t(($) => $.search.noSearchesFound);
  }

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 4 }}
      spacing={{ base: 10, sm: 'xl' }}
      verticalSpacing={{ base: 'md', sm: 'xl' }}
    >
      {searches.map((search) => (
        <SearchCard key={search.id} search={search} />
      ))}
    </SimpleGrid>
  );
};
