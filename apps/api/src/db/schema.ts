import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  doublePrecision,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { type SearchContent } from '@api/domain/entities/searches';

// Tables
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  deletedAt: timestamp('deleted_at'),
  deletedBy: text('deleted_by').references(() => users.id, {
    onDelete: 'cascade',
  }),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedBy: text('updated_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const tagTypeEnum = pgEnum('tag_type', [
  'string',
  'number',
  'date',
  'boolean',
]);

export const tags = pgTable(
  'tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    type: tagTypeEnum('type').notNull(),

    // creatable + updatable
    createdAt: timestamp('created_at').defaultNow().notNull(),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedBy: text('updated_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    // unique per name and per user
    unique().on(table.createdBy, table.name),
  ],
);

export const noteTags = pgTable(
  'note_tags',
  {
    noteId: uuid('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),

    valueNumber: doublePrecision('value_number'),
    valueDate: date('value_date'),
    valueBoolean: boolean('value_boolean'),

    // creatable + updatable
    createdAt: timestamp('created_at').defaultNow().notNull(),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedBy: text('updated_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.noteId, table.tagId] })],
);

export const searches = pgTable('searches', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: json('content').notNull().$type<SearchContent>(),
  name: text('name'),
  favorited: boolean().default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  deletedAt: timestamp('deleted_at'),
  deletedBy: text('deleted_by').references(() => users.id, {
    onDelete: 'cascade',
  }),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedBy: text('updated_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const invites = pgTable('invites', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  usedAt: timestamp('used_at'),
});

// Relations
export const notesRelations = relations(notes, ({ one }) => ({
  // Notes -> User
  creator: one(users, {
    fields: [notes.createdBy],
    references: [users.id],
  }),
  deleter: one(users, {
    fields: [notes.deletedBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [notes.updatedBy],
    references: [users.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many, one }) => ({
  // Tags -> NoteTags
  noteTags: many(noteTags),

  // Tags -> User
  creator: one(users, {
    fields: [tags.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [tags.updatedBy],
    references: [users.id],
  }),
}));

export const noteTagsRelations = relations(noteTags, ({ one }) => ({
  // NoteTags -> Notes
  note: one(notes, {
    fields: [noteTags.noteId],
    references: [notes.id],
  }),

  // NoteTags -> Tags
  tag: one(tags, {
    fields: [noteTags.tagId],
    references: [tags.id],
  }),

  // NoteTags -> User
  creator: one(users, {
    fields: [noteTags.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [noteTags.updatedBy],
    references: [users.id],
  }),
}));

export const searchesRelations = relations(searches, ({ one }) => ({
  // Searches -> User
  creator: one(users, {
    fields: [searches.createdBy],
    references: [users.id],
  }),
  deleter: one(users, {
    fields: [searches.deletedBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [searches.updatedBy],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  // Users -> Notes
  createdNotes: many(notes),

  // Users -> Tags
  createdTags: many(tags),

  // Users -> NoteTags
  createdNoteTags: many(noteTags),

  // Users -> Searches
  createdSearches: many(searches),
}));
