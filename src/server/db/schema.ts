// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  integer,
  json,
  pgTableCreator,
  serial,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { generateId } from "lucia";

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
  password_hash: varchar("password", { length: 256 }).notNull(),
});

export const sessionTable = createTable("session", {
  id: varchar("id", { length: 256 }).primaryKey(),
  userId: varchar("user_id", { length: 256 })
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const movies = createTable("movie", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  movie_data: json("movie_data").notNull(),
});

export const watchedMovies = createTable("watched-movies", {
  id: serial("id").primaryKey().notNull(),
  userId: varchar("user_id", { length: 256 })
    .notNull()
    .references(() => userTable.id),
  movideId: varchar("movie_id", { length: 256 })
    .notNull()
    .references(() => movies.id),
  duration: smallint("duration").notNull(),
  timeWatched: smallint("time_watched").notNull(),
});
