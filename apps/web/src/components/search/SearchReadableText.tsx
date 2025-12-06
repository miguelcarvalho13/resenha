import { useTranslation } from 'react-i18next';

import { type Search } from '@/models/searches';
import { TAG_COLOR } from '@/utils/tags';
import { trpc } from '@/utils/trpc';
import { Skeleton } from '@mantine/core';
import { TagWrapper } from '../tag/TagWrapper';

interface SearchReadableTextProps {
  search: Pick<Search, 'content'>;
}

export const SearchReadableText = ({ search }: SearchReadableTextProps) => {
  const { t } = useTranslation();
  const { data: tagsData, isLoading: isLoadingTags } =
    trpc.tags.findAllTags.useQuery();

  const getTagName = (id: string) =>
    tagsData?.tags.find((t) => t.id === id)?.name ?? '';

  if (isLoadingTags) {
    return <Skeleton />;
  }

  return (
    <>
      {search.content.query
        .map((filter) => {
          if ('tagId' in filter) {
            switch (filter.type) {
              case 'string':
                return (
                  <TagWrapper color={TAG_COLOR[filter.type]}>
                    {getTagName(filter.tagId)}
                  </TagWrapper>
                );
              case 'boolean':
                return (
                  <TagWrapper color={TAG_COLOR[filter.type]}>
                    {getTagName(filter.tagId)} {t(($) => $.common.is)}{' '}
                    {filter.operator.value
                      ? t(($) => $.tags.tagBoolean_YES)
                      : t(($) => $.tags.tagBoolean_NO)}
                  </TagWrapper>
                );
              case 'number':
              case 'date':
                return (
                  <TagWrapper color={TAG_COLOR[filter.type]}>
                    {getTagName(filter.tagId)} {filter.operator.type}{' '}
                    {filter.operator.value}
                  </TagWrapper>
                );
            }
          } else {
            switch (filter.field) {
              case 'deleted':
                return (
                  <TagWrapper color={TAG_COLOR['date']}>
                    {t(($) => $.tags.fixed.deleted)} {filter.operator.type}{' '}
                    {filter.operator.value}
                  </TagWrapper>
                );
            }
          }
        })
        .reduce((acc, x) => (
          <>
            {acc} {t(($) => $.common.and)} {x}
          </>
        ))}
    </>
  );
};
