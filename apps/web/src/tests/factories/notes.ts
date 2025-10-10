import { type NoteForFindAll } from '@/models/notes';

export const createNoteForFindAll = (
  data: Partial<NoteForFindAll> = {},
): NoteForFindAll => ({
  content: 'Lorem Ipsum',
  createdAt: new Date(),
  createdBy: '123123',
  id: '123456',
  updatedAt: new Date(),
  ...data,
});
