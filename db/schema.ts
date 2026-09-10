import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
export const tickets = sqliteTable(
  'tickets',
  {
    id: text('id').primaryKey(),
    tokenHash: text('token_hash').notNull(),
    kind: text('kind').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    modVersion: text('mod_version').notNull(),
    minecraft: text('minecraft').notNull(),
    gpu: text('gpu').notNull(),
    settings: text('settings').notNull(),
    status: text('status').notNull().default('open'),
    reply: text('reply').notNull().default(''),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [
    uniqueIndex('tickets_token_hash').on(t.tokenHash),
    index('tickets_status_created').on(t.status, t.createdAt),
    index('tickets_created').on(t.createdAt),
  ],
);
export const rateLimits = sqliteTable(
  'rate_limits',
  {
    key: text('key').primaryKey(),
    count: integer('count').notNull(),
    expiresAt: integer('expires_at').notNull(),
  },
  (t) => [index('rate_limits_expiry').on(t.expiresAt)],
);
