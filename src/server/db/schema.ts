// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  date,
  integer,
  json,
  pgTableCreator,
  primaryKey,
  serial as serial_without_erros,
  smallint,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { generateId } from "lucia";
import { type MovieDetail, type Season, type Serie } from "~/types/tmdb_detail";

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
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  movieDurationTotal: integer("movie_duration_total").notNull().default(0),

  movieWatched: integer("movie_watched").notNull().default(0),
  moviePlanned: integer("movie_planned").notNull().default(0),

  tvDurationTotal: integer("tv_duration_total").notNull().default(0),
  tvEpisodeCount: integer("tv_episode_count").notNull().default(0),

  tvSerieCompleted: integer("tv_serie_completed").notNull().default(0),
  tvSerieWatching: integer("tv_serie_watching").notNull().default(0),
  tvSeriePlanned: integer("tv_serie_planned").notNull().default(0),
  tvSerieDropped: integer("tv_serie_dropped").notNull().default(0),
  tvSeriePaused: integer("tv_serie_paused").notNull().default(0),

  tvSeasonCompleted: integer("tv_season_completed").notNull().default(0),
  tvSeasonWatching: integer("tv_season_watching").notNull().default(0),
  tvSeasonPlanned: integer("tv_season_planned").notNull().default(0),
  tvSeasonDropped: integer("tv_season_dropped").notNull().default(0),
  tvSeasonPaused: integer("tv_season_paused").notNull().default(0),
});

export const sessionTable = createTable("session", {
  id: varchar("id", { length: 256 }).primaryKey(),
  userId: varchar("user_id", { length: 256 })
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
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
  movie_data: json("movie_data").$type<MovieDetail>().notNull(),
});

export const moviesTableRelations = relations(moviesTable, ({ many }) => ({
  watchedBy: many(movieWatchedTable),
}));

export const movieWatchedTable = createTable(
  "movies-watched",
  {
    userId: varchar("user_id", { length: 256 })
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    movieId: varchar("movie_id", { length: 256 })
      .notNull()
      .references(() => moviesTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    duration: smallint("duration").notNull().default(-1),
    timeWatched: smallint("time_watched").notNull(),
    watchedAt: timestamp("watched_at").default(sql`timezone('utc', now())`),
  },
  (uToM) => ({
    union: primaryKey({
      name: "union",
      columns: [uToM.userId, uToM.movieId],
    }),
  }),
);

export const userToMovieRelations = relations(movieWatchedTable, ({ one }) => ({
  user: one(userTable, {
    fields: [movieWatchedTable.userId],
    references: [userTable.id],
  }),
  movie: one(moviesTable, {
    fields: [movieWatchedTable.movieId],
    references: [moviesTable.id],
  }),
}));

export const seriesTable = createTable("tv-series-table", {
  id: varchar("id", { length: 256 }).notNull().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  serie_data: json("serie_data").$type<Serie>().notNull(),
});

export const seriesRelations = relations(seriesTable, ({ many }) => ({
  seasons: many(seasonTable),
  watchedBy: many(seriesWatchedTable),
}));

const SeasonStatusEnum: readonly [string, ...string[]] = [
  "PLANNING",
  "WATCHING",
  "COMPLETED",
  "DROPPED",
  "PAUSED",
];

export const seriesWatchedTable = createTable("tv-series-watched", {
  id: serial_without_erros("id").primaryKey(),
  serieId: varchar("serie_id", { length: 256 })
    .notNull()
    .references(() => seriesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  userId: varchar("user_id", { length: 256 })
    .notNull()
    .references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  started: date("started"),
  ended: date("ended"),
  seasonCount: smallint("season_count").notNull().default(0),
  status: text("status", {
<<<<<<< HEAD
    enum: ["PLANNING", "WATCHING", "COMPLETED", "DROPPED"],
=======
    enum: SeasonStatusEnum,
  }),
  createdAt: timestamp("created_at").$defaultFn(() => {
    return new Date();
>>>>>>> temp-branch
  }),
});

export const seriesWatchedRelations = relations(
  seriesWatchedTable,
  ({ one, many }) => ({
    serie: one(seriesTable, {
      references: [seriesTable.id],
      fields: [seriesWatchedTable.serieId],
    }),
    user: one(userTable, {
      references: [userTable.id],
      fields: [seriesWatchedTable.userId],
    }),
    seasonWatched: many(seasonWatchedTable),
  }),
);

export const seasonTable = createTable("tv-season", {
  id: varchar("id").primaryKey().notNull(),
  season_data: json("season_data").$type<Season>().notNull(),
  seriesId: varchar("series_id")
    .notNull()
    .references(() => seriesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  serieName: varchar("serie_name", {
    length: 256,
  }).notNull(),
  seasonName: varchar("name", { length: 256 }).notNull(),
  episodeCount: integer("episode_count").notNull(),
});

export const seasonRelations = relations(seasonTable, ({ one }) => ({
  series: one(seriesTable, {
    references: [seriesTable.id],
    fields: [seasonTable.seriesId],
  }),
}));

export const seasonWatchedTable = createTable("tv-season-watched", {
  id: serial_without_erros("id").primaryKey(),
  seasonId: varchar("season_id")
    .references(() => seasonTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  userId: varchar("user_id")
    .references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  serieId: varchar("serie_id", { length: 256 })
    .notNull()
    .references(() => seriesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  serieWatch: integer("serie_watch_id")
    .notNull()
    .references(() => seriesWatchedTable.id, {
      onDelete: "no action",
      onUpdate: "no action",
    }),
  episodeWatched: smallint("episode_watched").notNull().default(0),
<<<<<<< HEAD
  status: text("status", {
    enum: ["PLANNING", "WATCHING", "COMPLETED", "DROPPED"],
=======
  started: date("started"),
  ended: date("ended"),
  status: text("status", {
    enum: SeasonStatusEnum,
>>>>>>> temp-branch
  }),
});

export const seasonWatchedRelations = relations(
  seasonWatchedTable,
  ({ one }) => ({
    season: one(seasonTable, {
      references: [seasonTable.id],
      fields: [seasonWatchedTable.seasonId],
    }),
    user: one(userTable, {
      references: [userTable.id],
      fields: [seasonWatchedTable.userId],
    }),
    serieWatch: one(seriesWatchedTable, {
      references: [seriesWatchedTable.id],
      fields: [seasonWatchedTable.serieWatch],
    }),
  }),
);
