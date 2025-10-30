import { Button, Combobox, useCombobox } from '@mantine/core';
import { useState } from 'react';
import { TbCirclePlus } from 'react-icons/tb';

import { NoteTagWrapper } from '@/components/tag/NoteTagWrapper';
import { type NoteTag } from '@/models/tags';
import { trpc } from '@/utils/trpc';

const FIXED_OPTION_VALUES = {
  boolean: 'new:boolean',
  date: 'new:date',
  number: 'new:number',
  string: 'new:string',
} satisfies { [key in NoteTag['type']]: string };

interface AddTagButtonProps {
  noteId: string;
}

const getNowDateValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const date = now.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${date}`;
};

export const AddTagButton = ({ noteId }: AddTagButtonProps) => {
  const [search, setSearch] = useState('');
  const utils = trpc.useUtils();
  const { mutate: createNoteTag, isPending } =
    trpc.tags.createNoteTag.useMutation({
      onSuccess: async () => {
        await utils.tags.findAllNoteTags.invalidate({ noteId });
      },
    });

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

  const onOptionSubmit = (value: string) => {
    const name = search;

    switch (value) {
      case FIXED_OPTION_VALUES.boolean:
        createNoteTag({ name, type: 'boolean', noteId, value: true });
        break;
      case FIXED_OPTION_VALUES.date:
        createNoteTag({ name, type: 'date', noteId, value: getNowDateValue() });
        break;
      case FIXED_OPTION_VALUES.number:
        createNoteTag({ name, type: 'number', noteId, value: 10 });
        break;
      case FIXED_OPTION_VALUES.string:
        createNoteTag({ name, type: 'string', noteId });
        break;
    }

    combobox.closeDropdown();
  };

  const newTagLabel = search.trim();
  const isNewTagAllowed = search.trim().length >= 1;

  return (
    <Combobox
      disabled={isPending}
      onOptionSubmit={onOptionSubmit}
      position="bottom-start"
      store={combobox}
      width="max-content"
    >
      <Combobox.Target withAriaAttributes={false}>
        <Button
          disabled={isPending}
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
