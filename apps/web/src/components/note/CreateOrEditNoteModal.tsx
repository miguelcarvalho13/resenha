import { Button, Modal, Stack, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

import { type NoteForFindAll } from '@/models/notes';
import { trpc } from '@/utils/trpc';

interface CreateOrEditNoteModalProps {
  close: () => void;
  mode: 'edit' | 'create';
  note?: NoteForFindAll;
  opened: boolean;
}

const createOrEditSchema = z.object({
  content: z.string().min(1),
});

type CreateOrEditSchemaType = z.infer<typeof createOrEditSchema>;

const CreateOrEditNoteModal = ({
  close,
  mode,
  note,
  opened,
}: CreateOrEditNoteModalProps) => {
  const utils = trpc.useUtils();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      content: note ? note.content : '',
    } satisfies CreateOrEditSchemaType,

    validate: zodResolver(createOrEditSchema),
  });

  const { mutateAsync: createNote } = trpc.notes.createNote.useMutation({
    onSuccess: () => {
      form.reset();
      close();
      utils.notes.findAll.invalidate();
    },
  });

  const { mutateAsync: editNote } = trpc.notes.editNote.useMutation({
    onSuccess: () => {
      form.reset();
      close();
      utils.notes.findAll.invalidate();
    },
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
      onClose={close}
      opened={opened}
      title={mode === 'create' ? 'Create note' : 'Edit note'}
    >
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Stack>
          <Textarea
            aria-label="Content"
            placeholder="Start typing here..."
            key={form.key('content')}
            {...form.getInputProps('content')}
          />

          <Button type="submit">Save</Button>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateOrEditNoteModal;
