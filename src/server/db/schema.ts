// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import {
  bigint,
  integer,
  json,
  pgTableCreator,
  primaryKey,
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

export const userTableRelation = relations(userTable, ({ one }) => ({
  info: one(userInfoTable, {
    fields: [userTable.id],
    references: [userInfoTable.userId],
  }),
}));

export const userInfoTable = createTable("user_info", {
  id: varchar("id", { length: 256 }).primaryKey().default(generateId(32)),
  userId: varchar("user_id", { length: 256 })
    .unique()
    .references(() => userTable.id),
  movieDurationTotal: integer("movie_duration_total").notNull().default(0),
  movieCountTotal: integer("movie_count_total").notNull().default(0),
  tvDurationTotal: integer("tv_duration_total").notNull().default(0),
  tvCountTotal: integer("tv_count_total").notNull().default(0),
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
  id: varchar("movie_id", {
    length: 256,
  })
    .primaryKey()
    .notNull(),
  movie_data: json("movie_data").notNull(),
});

export const moviesTableRelations = relations(moviesTable, ({ many }) => ({
  watchedBy: many(userToMovie),
}));

export const userToMovie = createTable(
  "watched-movies",
  {
    userId: varchar("user_id", { length: 256 })
      .notNull()
      .references(() => userTable.id),
    movieId: varchar("movie_id", { length: 256 })
      .notNull()
      .references(() => moviesTable.id),
    duration: smallint("duration").notNull(),
    timeWatched: smallint("time_watched").notNull(),
    dateWatched: timestamp("date_watched").notNull(),
  },
  (uToM) => ({
    union: primaryKey({
      name: "union",
      columns: [uToM.userId, uToM.movieId],
    }),
  }),
);

export const userToMovieRelations = relations(userToMovie, ({ one }) => ({
  user: one(userTable, {
    fields: [userToMovie.userId],
    references: [userTable.id],
  }),
  movie: one(moviesTable, {
    fields: [userToMovie.movieId],
    references: [moviesTable.id],
  }),
}));

export const episodeTable = createTable("episode", {
  id: varchar("id", {
    length: 256,
  }).primaryKey(),
  episodeDate: json("episode_date"),
});

export const episodeRelations = relations(episodeTable, ({ many }) => ({
  watchedBy: many(episodeWatched),
}));

export const episodeWatched = createTable("episode-watched", {
  userId: varchar("user_id", { length: 256 })
    .notNull()
    .references(() => userTable.id),
  episodeId: varchar("episode_id", { length: 256 })
    .notNull()
    .references(() => episodeTable.id),
  duration: smallint("duration").notNull(),
});

export const episodeWatRelations = relations(episodeWatched, ({ one }) => ({
  user: one(userTable, {
    fields: [episodeWatched.userId],
    references: [userTable.id],
  }),
  episode: one(episodeTable, {
    fields: [episodeWatched.episodeId],
    references: [episodeTable.id],
  }),
}));
