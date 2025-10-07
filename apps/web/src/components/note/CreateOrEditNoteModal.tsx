import { Button, Modal, Stack, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

import { trpc } from '@/utils/trpc';

interface CreateOrEditNoteModalProps {
  close: () => void;
  opened: boolean;
}

const createOrEditSchema = z.object({
  content: z.string().min(1),
});

type CreateOrEditSchemaType = z.infer<typeof createOrEditSchema>;

const CreateOrEditNoteModal = ({
  close,
  opened,
}: CreateOrEditNoteModalProps) => {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      content: '',
    } satisfies CreateOrEditSchemaType,

    validate: zodResolver(createOrEditSchema),
  });

  const { mutateAsync: createNote } = trpc.notes.createNote.useMutation({
    onSuccess: () => {
      form.reset();
      close();
    },
  });

  const handleSubmit = (values: CreateOrEditSchemaType) =>
    createNote({
      content: values.content,
    });

  return (
    <Modal opened={opened} onClose={close} title="Create note" centered>
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
