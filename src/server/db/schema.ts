// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { v4 as uuid } from "uuid";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `siuwi-tracker_${name}`);

export const userTable = createTable("user", {
  id: varchar("id", { length: 256 }).primaryKey(),
  username: varchar("username", { length: 256 }).notNull().unique(),
  password: varchar("password", { length: 256 }).notNull(),
});

export const sessionTable = createTable("session", {
  id: varchar("id", { length: 256 }).primaryKey().default(uuid()),
  userId: varchar("user_id", { length: 256 })
    .notNull()
    .references(() => userTable.id),
  username: varchar("username", { length: 256 }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
