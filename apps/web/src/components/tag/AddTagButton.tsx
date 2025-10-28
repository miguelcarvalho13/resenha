import { Button, Menu } from '@mantine/core';
import { TbCirclePlus } from 'react-icons/tb';

import { NoteTagWrapper } from '@/components/tag/NoteTagWrapper';

export const AddTagButton = () => (
  <Menu position="bottom-start" shadow="md">
    <Menu.Target>
      <Button
        justify="center"
        leftSection={<TbCirclePlus className="-mr-2" />}
        radius="xl"
        size="compact-xs"
        variant="outline"
      >
        Add tag
      </Button>
    </Menu.Target>

    <Menu.Dropdown>
      <Menu.Item>
        <NoteTagWrapper color="gray">new</NoteTagWrapper>
      </Menu.Item>
      <Menu.Item>
        <NoteTagWrapper color="gray">new: number</NoteTagWrapper>
      </Menu.Item>
      <Menu.Item>
        <NoteTagWrapper color="gray">new: date</NoteTagWrapper>
      </Menu.Item>
      <Menu.Item>
        <NoteTagWrapper color="gray">new: yes/no</NoteTagWrapper>
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
);
