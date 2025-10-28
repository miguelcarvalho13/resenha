import { type NoteTag } from '@/models/tags';

export const createNoteTag = (data: Partial<NoteTag> = {}): NoteTag => ({
  createdAt: new Date(),
  name: 'my-string-tag',
  tagId: crypto.randomUUID(),
  noteId: crypto.randomUUID(),
  type: 'string',
  updatedAt: new Date(),
  value: 'my-string-tag',
  ...data,
});
