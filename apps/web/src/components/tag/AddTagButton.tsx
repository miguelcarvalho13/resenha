import { Button, Combobox, useCombobox } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbPlus } from 'react-icons/tb';

import { TagWrapper } from '@/components/tag/TagWrapper';
import { type NoteTag } from '@/models/tags';
import { useTRPC } from '@/utils/trpc';
import { Tag } from './Tag';

const FIXED_OPTION_VALUES = {
  boolean: 'new:boolean',
  date: 'new:date',
  number: 'new:number',
  string: 'new:string',
} as const satisfies { [key in NoteTag['type']]: string };

const FIXED_OPTIONS_ORDER = [
  'string',
  'number',
  'date',
  'boolean',
] satisfies NoteTag['type'][];

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
  const trpc = useTRPC();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: tagsData } = useQuery(trpc.tags.findAllTags.queryOptions());
  const { data: noteTagsData } = useQuery(
    trpc.tags.findAllNoteTags.queryOptions({ noteId }),
  );

  const { mutate: createNoteTag, isPending } = useMutation(
    trpc.tags.createNoteTag.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.tags.findAllNoteTags.queryFilter({ noteId }),
        );
      },
    }),
  );

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

  const createNoteTagFromExistingTag = (optionValue: string) => {
    const [type, name] = optionValue.split('|') as [NoteTag['type'], string];

    switch (type) {
      case 'boolean':
        createNoteTag({ name, type, noteId, value: true });
        break;
      case 'date':
        createNoteTag({ name, type, noteId, value: getNowDateValue() });
        break;
      case 'number':
        createNoteTag({ name, type, noteId, value: 10 });
        break;
      case 'string':
        createNoteTag({ name, type, noteId });
        break;
    }
  };

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
      default:
        createNoteTagFromExistingTag(value);
        break;
    }

    combobox.closeDropdown();
  };

  const sanitizedSearch = search.trim();

  const filteredTags = tagsData?.tags
    .filter(
      (tag) => !noteTagsData?.noteTags.some(({ name }) => name === tag.name),
    )
    .filter((tag) =>
      tag.name
        .toLocaleLowerCase()
        .includes(sanitizedSearch.toLocaleLowerCase()),
    )
    .sort((tagA, tagB) => tagA.name.localeCompare(tagB.name));

  const isNewTagAllowed = !filteredTags?.length && sanitizedSearch.length >= 1;

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
          leftSection={<TbPlus className="-mr-2" />}
          onClick={() => combobox.toggleDropdown()}
          radius="xl"
          size="compact-xs"
          variant="outline"
        >
          {t(($) => $.tags.addTag)}
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          aria-label={t(($) => $.tags.searchTags)}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder={t(($) => $.tags.searchTags)}
          value={search}
        />
        <Combobox.Options aria-label={t(($) => $.tags.listOfTags)}>
          {filteredTags?.map((tag) => (
            <Combobox.Option key={tag.name} value={`${tag.type}|${tag.name}`}>
              <Tag data-testid="tag-new" name={tag.name} type={tag.type} />
            </Combobox.Option>
          ))}
          {isNewTagAllowed && (
            <>
              {Object.entries(FIXED_OPTION_VALUES)
                .sort(
                  ([a], [b]) =>
                    FIXED_OPTIONS_ORDER.indexOf(a as NoteTag['type']) -
                    FIXED_OPTIONS_ORDER.indexOf(b as NoteTag['type']),
                )
                .map(([type, value]) => (
                  <Combobox.Option key={value} value={value}>
                    <TagWrapper color="gray" data-testid="tag-new">
                      {sanitizedSearch}
                      {t(($) => $.tags.newTagSuffix, { context: type })}
                    </TagWrapper>
                  </Combobox.Option>
                ))}
            </>
          )}
          {!isNewTagAllowed && (
            <Combobox.Empty>{t(($) => $.tags.noTagsFound)}</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
