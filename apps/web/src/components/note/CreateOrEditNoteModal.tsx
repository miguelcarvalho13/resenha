import { Box, Button, Modal, Stack, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { FixedNoteTagContainer } from '@/components/tag/FixedNoteTagContainer';
import { NoteTagContainer } from '@/components/tag/NoteTagContainer';
import { type NoteForFindAll } from '@/models/notes';
import { trpc } from '@/utils/trpc';

interface CreateOrEditNoteModalProps {
  close: () => void;
  mode: 'edit' | 'create';
  note?: NoteForFindAll;
  opened: boolean;
}

const createOrEditSchema = z.object({
  content: z
    .string()
    .min(1, { error: 'String must contain at least 1 character(s)' }),
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
  close,
  mode,
  note,
  opened,
}: CreateOrEditNoteModalProps) => {
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: getFormValues({ note }),

    validate: zod4Resolver(createOrEditSchema),
  });

  const onSuccess = async () => {
    close();
    form.resetDirty();
    await utils.notes.findAll.invalidate();
  };

  const { mutateAsync: createNote } = trpc.notes.createNote.useMutation({
    onSuccess,
  });

  const { mutateAsync: editNote } = trpc.notes.editNote.useMutation({
    onSuccess,
  });

  const handleSubmit = (values: CreateOrEditSchemaType) => {
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
  };

  return (
    <Modal
      centered
      onClose={() => {
        close();
        form.reset();
      }}
      opened={opened}
      title={
        mode === 'create'
          ? t(($) => $.notes.createNote)
          : t(($) => $.notes.editNote)
      }
    >
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Stack>
          <Textarea
            aria-label="Content"
            placeholder="Start typing here..."
            key={form.key('content')}
            {...form.getInputProps('content')}
          />

          {note && <NoteTagContainer note={note} />}

          <Box bd="1px dashed gray.2" />

          {note && <FixedNoteTagContainer note={note} />}

          <Button type="submit">Save</Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateOrEditNoteModal;
