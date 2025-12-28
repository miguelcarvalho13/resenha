export const TAG_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  DATE: 'date',
  BOOLEAN: 'boolean',
} as const;

export type TagType = (typeof TAG_TYPES)[keyof typeof TAG_TYPES];

export const ALL_TAG_TYPES = [
  'string',
  'number',
  'date',
  'boolean',
] as const satisfies TagType[];
