import { delay, http, type PathParams } from 'msw';

import { createNoteTagMock, createTagMock } from '@/mocks/factories/tags';
import {
  createTrpcJson,
  extractTrpcInput,
  type TrpcInput,
} from '@/mocks/factories/trpc';
import {
  noteTagMock,
  type NoteTagMockSchemaType,
  tagMock,
} from '@/mocks/models/tags';
import { type RouterInput, type RouterOutput } from '@/utils/trpc';
import { noteMock } from '../models/notes';
import { server } from '../server';

export const getFindAllTagsHandler = ({
  wait = 0,
}: {
  wait?: number;
} = {}) =>
  http.get('/api/trpc/tags.findAllTags', async () => {
    await delay(wait || server.timing);

    return createTrpcJson({
      success: true,
      tags: tagMock.all(),
    } satisfies RouterOutput['tags']['findAllTags']);
  });

export const getFindAllNoteTagsHandler = ({
  wait = 0,
}: {
  wait?: number;
} = {}) =>
  http.get('/api/trpc/tags.findAllNoteTags', async () => {
    await delay(wait || server.timing);

    return createTrpcJson({
      success: true,
      noteTags: noteTagMock.all(),
    } satisfies RouterOutput['tags']['findAllNoteTags']);
  });

export const postCreateNoteTagHandler = ({
  wait = 0,
}: { wait?: number } = {}) =>
  http.post<PathParams, TrpcInput<RouterInput['tags']['createNoteTag']>>(
    '/api/trpc/tags.createNoteTag',
    async ({ request }) => {
      await delay(wait || server.timing);

      const input = extractTrpcInput(await request.clone().json());

      const tag = await createTagMock({
        name: input.name,
        type: input.type,
      });

      const noteTag = await createNoteTagMock({
        name: tag.name,
        note: noteMock.findFirst((q) => q.where({ id: input.noteId })),
        tag,
        type: input.type,
        value: 'value' in input ? input.value : input.name,
      } as Partial<NoteTagMockSchemaType>);

      return createTrpcJson({
        success: true,
        noteTag: {
          ...noteTag,
          createdBy: tag.createdBy,
          updatedBy: tag.updatedBy,
        },
        tag,
      } satisfies RouterOutput['tags']['createNoteTag']);
    },
  );

export const postDeleteNoteTagHandler = ({
  wait = 0,
}: { wait?: number } = {}) =>
  http.post<PathParams, TrpcInput<RouterInput['tags']['deleteNoteTag']>>(
    '/api/trpc/tags.deleteNoteTag',
    async ({ request }) => {
      await delay(wait || server.timing);

      const input = extractTrpcInput(await request.clone().json());

      const noteTag = noteTagMock.findFirst((q) => q.where({ ...input }))!;
      const tag = noteTag.tag!;

      noteTagMock.delete((q) => q.where({ ...input }));

      return createTrpcJson({
        success: true,
        noteTag: {
          ...noteTag,
          createdBy: tag.createdBy,
          updatedBy: tag.updatedBy,
        },
      } satisfies RouterOutput['tags']['deleteNoteTag']);
    },
  );

export const postEditNoteTagHandler = ({ wait = 0 }: { wait?: number } = {}) =>
  http.post<PathParams, TrpcInput<RouterInput['tags']['editNoteTag']>>(
    '/api/trpc/tags.editNoteTag',
    async ({ request }) => {
      await delay(wait || server.timing);

      const input = extractTrpcInput(await request.clone().json());

      const updatedNoteTag = (await noteTagMock.update(
        (q) => q.where({ noteId: input.noteId, tagId: input.tagId }),
        {
          data(noteTag) {
            noteTag.value = input.value;

            if (
              noteTag.tag!.type === 'string' &&
              typeof input.value === 'string'
            ) {
              noteTag.name = input.value;
              noteTag.tag!.name = input.value;
            }
          },
        },
      ))!;

      const tag = updatedNoteTag.tag!;

      return createTrpcJson({
        success: true,
        noteTag: {
          ...updatedNoteTag,
          createdBy: tag.createdBy,
          updatedBy: tag.updatedBy,
        },
        tag,
      } satisfies RouterOutput['tags']['editNoteTag']);
    },
  );
