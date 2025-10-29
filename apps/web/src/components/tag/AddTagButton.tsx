import { Button, Combobox, useCombobox } from '@mantine/core';
import { useState } from 'react';
import { TbCirclePlus } from 'react-icons/tb';

import { NoteTagWrapper } from '@/components/tag/NoteTagWrapper';
import { type NoteTag } from '@/models/tags';

const FIXED_OPTION_VALUES = {
  boolean: 'new:boolean',
  date: 'new:date',
  number: 'new:number',
  string: 'new:string',
} satisfies { [key in NoteTag['type']]: string };

export const AddTagButton = () => {
  const [search, setSearch] = useState('');

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
      setSearch('');
    },

    onDropdownOpen: () => {
      combobox.focusSearchInput();
    },
  });

  const onOptionSubmit = () => {
    combobox.closeDropdown();
  };

  const newTagLabel = search.trim();
  const isNewTagAllowed = search.trim().length >= 1;

  return (
    <Combobox
      onOptionSubmit={onOptionSubmit}
      position="bottom-start"
      store={combobox}
      width="max-content"
    >
      <Combobox.Target withAriaAttributes={false}>
        <Button
          justify="center"
          leftSection={<TbCirclePlus className="-mr-2" />}
          onClick={() => combobox.toggleDropdown()}
          radius="xl"
          size="compact-xs"
          variant="outline"
        >
          Add tag
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          aria-label="Search tags"
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Search tags"
          value={search}
        />
        <Combobox.Options aria-label="List of tags">
          {isNewTagAllowed && (
            <>
              <Combobox.Option value={FIXED_OPTION_VALUES.string}>
                <NoteTagWrapper color="gray" data-testid="tag-new">
                  {newTagLabel}
                </NoteTagWrapper>
              </Combobox.Option>
              <Combobox.Option value={FIXED_OPTION_VALUES.number}>
                <NoteTagWrapper color="gray" data-testid="tag-new">
                  {newTagLabel}: number
                </NoteTagWrapper>
              </Combobox.Option>
              <Combobox.Option value={FIXED_OPTION_VALUES.date}>
                <NoteTagWrapper color="gray" data-testid="tag-new">
                  {newTagLabel}: date
                </NoteTagWrapper>
              </Combobox.Option>
              <Combobox.Option value={FIXED_OPTION_VALUES.boolean}>
                <NoteTagWrapper color="gray" data-testid="tag-new">
                  {newTagLabel}: yes/no
                </NoteTagWrapper>
              </Combobox.Option>
            </>
          )}
          {!isNewTagAllowed && <Combobox.Empty>No tags found</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
