import { Combobox, Input, Loader, useCombobox } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type GetInputPropsReturnType } from '@mantine/form';

import { Tag } from '@/components/tag/Tag';
import { TagWrapper } from '@/components/tag/TagWrapper';
import { TAG_COLOR } from '@/utils/tags';
import { trpc } from '@/utils/trpc';

interface SearchNotesModalRowTagInputProps extends GetInputPropsReturnType {}

export const SearchNotesModalRowTagInput = ({
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  error,
}: SearchNotesModalRowTagInputProps) => {
  const { t } = useTranslation();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState('');

  const { data: tagsData, isLoading } = trpc.tags.findAllTags.useQuery();

  const currentTag =
    tagsData?.tags.find(({ id }) => id === value) ??
    tagsData?.tags.find(({ id }) => id === defaultValue);

  const sanitizedSearch = search.trim();

  const filteredTags = tagsData?.tags
    .filter((tag) =>
      tag.name
        .toLocaleLowerCase()
        .includes(sanitizedSearch.toLocaleLowerCase()),
    )
    .sort((tagA, tagB) => tagA.name.localeCompare(tagB.name));

  return (
    <Combobox
      onOptionSubmit={(tagId) => {
        combobox.closeDropdown();
        setSearch('');
        onChange(tagId);
      }}
      store={combobox}
    >
      <Combobox.Target>
        <Input.Wrapper error={error}>
          {currentTag && <Tag name={currentTag.name} type={currentTag.type} />}
          <Input
            aria-label={t(($) => $.search.modal.tag)}
            placeholder={t(($) => $.tags.searchTags)}
            value={value}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              combobox.resetSelectedOption();
              combobox.openDropdown();
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={(...args) => {
              combobox.openDropdown();
              onFocus?.(...args);
            }}
            onBlur={(...args) => {
              combobox.closeDropdown();
              onBlur?.(...args);
            }}
            rightSection={isLoading && <Loader size={18} />}
            type={currentTag ? 'hidden' : undefined}
          />
        </Input.Wrapper>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options aria-label={t(($) => $.tags.listOfTags)}>
          {filteredTags?.map((tag) => (
            <Combobox.Option key={tag.name} value={tag.id}>
              <TagWrapper color={TAG_COLOR[tag.type]}>
                {tag.name}
                {t(($) => $.tags.newTagSuffix, { context: tag.type })}
              </TagWrapper>
            </Combobox.Option>
          ))}
          {!filteredTags?.length && (
            <Combobox.Empty>{t(($) => $.tags.noTagsFound)}</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
