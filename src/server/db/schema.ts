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

export const moviesTable = createTable("movie", {
  movie_data: json("movie_data").notNull(),
  id: varchar("movie_id", {
    length: 256,
  })
    .primaryKey()
    .notNull(),
});

export const watchedMovie = createTable("watched-movies", {
  id: serial("id").primaryKey().notNull(),
  userId: varchar("user_id", { length: 256 }).references(() => userTable.id),
  movieId: varchar("movie_id").references(() => moviesTable.id),
  union: varchar("union").unique().notNull(),
  duration: smallint("duration").notNull(),
  timeWatched: smallint("time_watched").notNull(),
  dateWatched: timestamp("date_watched").notNull(),
});
