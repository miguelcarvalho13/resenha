import { Button, Combobox, useCombobox } from '@mantine/core';
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
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
    },

    onDropdownOpen: () => {
      combobox.focusSearchInput();
    },
  });

  const onOptionSubmit = () => {
    combobox.closeDropdown();
  };

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
        <Combobox.Options aria-label="List of tags">
          <Combobox.Option value={FIXED_OPTION_VALUES.string}>
            <NoteTagWrapper color="gray" data-testid="tag-new">
              new
            </NoteTagWrapper>
          </Combobox.Option>
          <Combobox.Option value={FIXED_OPTION_VALUES.number}>
            <NoteTagWrapper color="gray" data-testid="tag-new">
              new: number
            </NoteTagWrapper>
          </Combobox.Option>
          <Combobox.Option value={FIXED_OPTION_VALUES.date}>
            <NoteTagWrapper color="gray" data-testid="tag-new">
              new: date
            </NoteTagWrapper>
          </Combobox.Option>
          <Combobox.Option value={FIXED_OPTION_VALUES.boolean}>
            <NoteTagWrapper color="gray" data-testid="tag-new">
              new: yes/no
            </NoteTagWrapper>
          </Combobox.Option>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
