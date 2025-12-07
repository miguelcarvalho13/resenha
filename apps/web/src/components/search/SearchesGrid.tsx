import { useTranslation } from 'react-i18next';

import { CommonGrid } from '@/components/common/CommonGrid';
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
    <CommonGrid>
      {searches.map((search) => (
        <SearchCard key={search.id} search={search} />
      ))}
    </CommonGrid>
  );
};
