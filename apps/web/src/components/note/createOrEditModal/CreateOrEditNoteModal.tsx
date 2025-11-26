import { Box, Stack, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useThrottledCallback } from '@mantine/hooks';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod';

import { FixedNoteTagContainer } from '@/components/tag/FixedNoteTagContainer';
import { NoteTagContainer } from '@/components/tag/NoteTagContainer';
import { type NoteForFindAll } from '@/models/notes';
import { trpc } from '@/utils/trpc';

interface CreateOrEditNoteModalProps {
  note?: NoteForFindAll;
}

const createOrEditSchema = z.object({
  content: z.string(),
});

type CreateOrEditSchemaType = z.infer<typeof createOrEditSchema>;

const getFormValues = ({
  note,
}: {
  note?: NoteForFindAll;
}): CreateOrEditSchemaType => ({
  content: note ? note.content : '',
});

const CreateOrEditNoteModal = ({
  note: noteArg,
}: CreateOrEditNoteModalProps) => {
  const [note, setNote] = useState(noteArg);
  const utils = trpc.useUtils();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: getFormValues({ note }),

    validate: zod4Resolver(createOrEditSchema),
  });

  const onSuccess = async ({ note: savedNote }: { note: NoteForFindAll }) => {
    setNote(savedNote);
    await utils.searches.searchNotes.invalidate();
  };

  const { mutateAsync: createNote } = trpc.notes.createNote.useMutation({
    onSuccess,
  });

  const { mutateAsync: editNote } = trpc.notes.editNote.useMutation({
    onSuccess,
  });

  const handleSubmit = useThrottledCallback(
    (values: CreateOrEditSchemaType) => {
      if (note) {
        return editNote({
          id: note.id,
          content: values.content,
        });
      } else {
        return createNote({
          content: values.content,
        });
      }
    },
    500,
  );

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <Stack>
        <Textarea
          aria-label="Content"
          placeholder="Start typing here..."
          key={form.key('content')}
          {...form.getInputProps('content')}
          onChange={(e) => {
            form.getInputProps('content').onChange(e);
            handleSubmit(form.getValues());
          }}
        />

        {note && <NoteTagContainer note={note} />}

        <Box bd="1px dashed gray.2" />

        {note && <FixedNoteTagContainer note={note} />}
      </Stack>
    </form>
  );
};

export default CreateOrEditNoteModal;
