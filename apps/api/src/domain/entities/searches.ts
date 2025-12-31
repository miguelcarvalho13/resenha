import { z } from 'zod';

const dateOperators = z.object({
  type: z.union([
    z.literal('<'),
    z.literal('<='),
    z.literal('='),
    z.literal('>'),
    z.literal('>='),
    // TODO: Skipping NOT IS/HAVE condition for now, but needs to be implemented in the future.
    // z.literal('!='),
  ]),
  value: z.iso.date(),
});

const numberOperators = z.object({
  type: z.union([
    z.literal('<'),
    z.literal('<='),
    z.literal('='),
    z.literal('>'),
    z.literal('>='),
    // TODO: Skipping NOT IS/HAVE condition for now, but needs to be implemented in the future.
    // z.literal('!='),
  ]),
  value: z.number(),
});

const booleanOperators = z.object({
  type: z.union([
    z.literal('='),
    // TODO: Skipping NOT IS/HAVE condition for now, but needs to be implemented in the future.
    // z.literal('!=')
  ]),
  value: z.boolean(),
});

const stringOperators = z.object({
  type: z.union([
    z.literal('='),
    // TODO: Skipping NOT IS/HAVE condition for now, but needs to be implemented in the future.
    // z.literal('!=')
  ]),
});

/**
  sample:
  query: [
    { tagId: '123', type: 'date', operator: { type: '<=', value: '2025-11-07' } },
    { tagId: '123', type: 'date', operator: { type: '>=', value: '2025-01-01' } },
    { tagId: '456', type: 'boolean', operator: { type: '=', value: true } },
    { tagId: '789', type: 'number', operator: { type: '=', value: 10 } },
    { tagId: '001', type: 'string', operator: { type: '=' } },
    { tagId: '001', type: 'string', operator: { type: '!=' } },
    { field: 'created', type: 'date', operator: { type: '<=', value: '2025-11-07' } },
    { field: 'updated', type: 'date', operator: { type: '<=', value: '2025-11-07' } },
    { field: 'deleted', type: 'date', operator: { type: '<=', value: '2025-11-07' } },
  ]
 */
export const searchContentSchema = () =>
  z.object({
    query: z.array(
      z.union([
        z.discriminatedUnion('type', [
          z.object({
            tagId: z.uuid(),
            type: z.literal('string'),
            operator: stringOperators,
          }),
          z.object({
            tagId: z.uuid(),
            type: z.literal('number'),
            operator: numberOperators,
          }),
          z.object({
            tagId: z.uuid(),
            type: z.literal('date'),
            operator: dateOperators,
          }),
          z.object({
            tagId: z.uuid(),
            type: z.literal('boolean'),
            operator: booleanOperators,
          }),
          // TODO: implement date operators for 'created' and 'updated'
          // z.object({
          //   field: z.union([z.literal('created'), z.literal('updated')]),
          //   type: z.literal('date'),
          //   operator: dateOperators,
          // }),
        ]),
        z.discriminatedUnion('field', [
          z.object({
            field: z.literal('deleted'),
            operator: dateOperators,
          }),
        ]),
      ]),
    ),
  });

export const searchSchema = () =>
  z.object({
    content: z.object(searchContentSchema().shape),
    createdAt: z.date(),
    createdBy: z.uuid(),
    deletedAt: z.date().nullable(),
    deletedBy: z.uuid().nullable(),
    favorited: z.boolean(),
    id: z.uuid(),
    name: z.string(),
    updatedAt: z.date(),
    updatedBy: z.uuid(),
  });

export type BooleanOperatorsType = z.infer<typeof booleanOperators>;
export type DateOperatorsType = z.infer<typeof dateOperators>;
export type NumberOperatorsType = z.infer<typeof numberOperators>;
export type StringOperatorsType = z.infer<typeof stringOperators>;
export type SearchContent = z.infer<ReturnType<typeof searchContentSchema>>;
export type Search = z.infer<ReturnType<typeof searchSchema>>;
