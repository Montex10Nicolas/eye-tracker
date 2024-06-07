"use server";
import { and, eq, sql, type SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  getOrCreateTVSeason,
  getOrCreateTVSeasonWatched,
  getOrCreateTVSeries,
  getOrCreateTVSeriesWatched,
  getTVSeried,
  getTVSeriesWatched,
  updateInfo,
  updateInfoWatchComp,
  updateOrCreateOrDeleteSeasonWatch,
  updateSeasonCompletitionByID,
  updateSeasonCompletitionByUser,
  updateSeasonWatch,
  updateSerieStatusWatch,
  updateSerieWatch,
} from "~/_utils/actions_helpers";
import { db } from "~/server/db";
import {
  movieWatchedTable,
  moviesTable,
  seasonWatchedTable,
  seriesWatchedTable,
  userInfoTable,
} from "~/server/db/schema";
import {
  type DBErorr,
  type DBSeasonWatchedType,
  type DBSerieWatchedType,
  type StatusWatchedType,
} from "~/server/db/types";
import { type MovieDetail, type Season, type Serie } from "~/types/tmdb_detail";

export async function addMovie(movie: MovieDetail) {
  await db.insert(moviesTable).values({
    movie_data: movie,
    id: movie.id.toString(),
  });
}

export async function addToMovieWatched(userId: string, movie: MovieDetail) {
  const search_movie = await db.query.moviesTable.findFirst({
    where: (mov, { eq }) => eq(mov.id, movie.id.toString()),
  });

  // If the movie does not exist add it
  if (search_movie === undefined) {
    await addMovie(movie);
  }

  // Try to create the watched record, if already exist throw error
  try {
    await db.insert(movieWatchedTable).values({
      movieId: movie.id.toString(),
      userId: userId,
      duration: movie.runtime,
      timeWatched: 1,
      watchedAt: new Date(),
    });
  } catch (e: unknown) {
    // Add update the watch count and duration
    const movieId = movie.id.toString();
    const record = await db.query.movieWatchedTable.findFirst({
      where: (rec, { eq, and }) =>
        and(eq(rec.userId, userId), eq(rec.movieId, movieId)),
    });
    if (record === undefined) {
      throw new Error("Record does not exist and it should");
    }

    const time_watched = record.timeWatched + 1;
    await db
      .update(movieWatchedTable)
      .set({
        timeWatched: time_watched,
      })
      .where(
        and(
          eq(movieWatchedTable.userId, userId),
          eq(movieWatchedTable.movieId, movieId),
        ),
      );
  }

  try {
    const info = await db.query.userInfoTable.findFirst({
      where: (info, { eq }) => eq(info.userId, userId),
    });

    if (info === undefined) {
      throw new Error("Info is undefined");
    }

    const count = info.movieWatched + 1;
    const duration = info.movieDurationTotal + movie.runtime;

    await db
      .update(userInfoTable)
      .set({ movieWatched: count, movieDurationTotal: duration })
      .where(eq(userInfoTable.id, info.id));
  } catch (e: unknown) {
    const err = e as DBErorr;
    console.log(err);
  }
}

export async function checkMovieWatched(userId: string, movieId: string) {
  return (
    (await db.query.movieWatchedTable.findFirst({
      where: (mov, { eq }) =>
        and(eq(mov.userId, userId), eq(mov.movieId, movieId)),
    })) !== undefined
  );
}

export async function removeFromMovieWatched(
  userId: string,
  movie: MovieDetail,
) {
  "use server";
  try {
    const deleted = await db
      .delete(movieWatchedTable)
      .where(
        and(
          eq(movieWatchedTable.userId, userId),
          eq(movieWatchedTable.movieId, movie.id.toString()),
        ),
      )
      .returning({
        timeWatched: movieWatchedTable.timeWatched,
      });

    if (deleted.length < 1 || deleted[0] === undefined) {
      throw new Error("Deleted is less than 1");
    }

    const { timeWatched } = deleted[0];

    const info = await db.query.userInfoTable.findFirst({
      where: (info, { eq }) => eq(info.userId, userId),
    });

    if (info === undefined || info === null) {
      throw new Error("info should be existing");
    }

    const movie_data = await db.query.moviesTable.findFirst({
      where: (mov, { eq }) => eq(moviesTable.id, mov.id),
    });

    if (movie_data === undefined || movie_data === null) {
      throw new Error("Movie cannot be null");
    }

    const runtime_to_remove = movie.runtime * timeWatched;
    const runtime = info.movieDurationTotal - runtime_to_remove;
    const time = info.movieWatched - timeWatched;

    await db
      .update(userInfoTable)
      .set({
        movieWatched: runtime,
        movieDurationTotal: time,
      })
      .where(eq(userInfoTable.userId, userId));
  } catch (e: unknown) {
    console.log("Error while deleting", e);
  }
}

export interface SeriesAndSeasonsWatched {
  serie: DBSerieWatchedType;
  seasons: DBSeasonWatchedType[];
}

// Return info about a series and it's season in relation to a user
export async function getUserWatchedTVAndSeason(
  userId: string | undefined,
  serieId: string,
) {
  if (userId === undefined) {
    return undefined;
  }

  const serie: DBSerieWatchedType | undefined = await getTVSeriesWatched(
    userId,
    serieId,
  );

  if (serie === undefined) {
    return undefined;
  }

  const seasons = await db.query.seasonWatchedTable.findMany({
    where: (ses, { and, eq }) =>
      and(eq(ses.userId, userId), eq(ses.serieId, serieId)),
  });

  return {
    serie: serie,
    seasons: seasons,
  };
}

export interface UpdateSeasonWatchData {
  episodeCount: number;
  status?: StatusWatchedType;
  started?: Date | null;
  ended?: Date | null;
}

// Function for button "+/-" in profile
export async function addOrRemoveOneEpisode(
  userId: string,
  dbSeasonId: number,
  serie: Serie,
  episodeCount: 1 | -1,
) {
  await db
    .update(seasonWatchedTable)
    .set({
      episodeWatched:
        sql`${seasonWatchedTable.episodeWatched} + ${episodeCount}` as
          | number
          | SQL<unknown>,
    })
    .where(eq(seasonWatchedTable.id, dbSeasonId));

  const serieId = serie.id.toString();

  const ep_runtime = serie.episode_run_time[0];
  const DEFAULT_RUNTIME = 40;
  const runtime =
    ep_runtime === undefined ? DEFAULT_RUNTIME : ep_runtime * episodeCount;

  await updateSeasonCompletitionByID(dbSeasonId);
  await updateSerieStatusWatch(userId, serieId);
  await updateInfo(userId, 0, 0, runtime, episodeCount, 0, 0);
  await updateInfoWatchComp(userId);
}

export async function addEpisodeToSeasonWatched(
  userId: string,
  serie: Serie,
  season: Season,
  newInfo: UpdateSeasonWatchData,
) {
  const serieId = serie.id.toString(),
    seasonId = season.id.toString();

  await getOrCreateTVSeriesWatched(serieId, userId);
  await getOrCreateTVSeason(seasonId, season, serieId, serie.name);
  const [pre, post] = await updateOrCreateOrDeleteSeasonWatch(
    seasonId,
    serieId,
    userId,
    newInfo,
  );

  if (pre === undefined || post === undefined) {
    throw new Error("How can this two be undefined");
  }

  // UPDATE INFO AND SERIE WATCH
  const ep_diff = post !== null ? post.episodeWatched : 0 - pre.episodeWatched;

  // RUNTIME
  const ep_runtime = serie.episode_run_time[0];
  const DEFAULT_RUNTIME = 40;
  const runtime =
    ep_runtime === undefined ? DEFAULT_RUNTIME : ep_runtime * ep_diff;

  await updateSeasonCompletitionByUser(userId, serieId);
  await updateSerieStatusWatch(userId, serieId);
  await updateInfo(userId, 0, 0, runtime, ep_diff, 0, 0);
  await updateInfoWatchComp(userId);

  revalidatePath(`/detail/tv/${serie.id}`);
}

export async function markSeriesAsCompleted(
  userId: string,
  serieId: string,
  serieData: Serie,
) {
  const watched = await getOrCreateTVSeriesWatched(serieId, userId);

  // Get or create all season of a series and then update each one of them
  const serie = await getOrCreateTVSeries(serieId, serieData);
  const {
    serie_data: { seasons },
    name: serieName,
  } = serie;

  for (const season of seasons) {
    const seasonId = season.id.toString();

    await getOrCreateTVSeason(seasonId, season, serieId, serieName);

    const seasonWatched = await getOrCreateTVSeasonWatched(
      userId,
      serieId,
      seasonId,
    );
    const seasonWatchId = seasonWatched.id;

    const preEp = seasonWatched.episodeWatched;

    await updateSeasonWatch(seasonWatchId, {
      episodeCount: season.episode_count,
      status: "COMPLETED",
      ended: new Date(),
    });

    console.log(seasonId, season.name, serieName, preEp, season.episode_count);
    const {
      serie_data: { episode_run_time },
    } = serie;
    let runtime = 40;
    if (episode_run_time[0] !== undefined) {
      runtime = episode_run_time[0];
    }
    const episodeCount = season.episode_count - preEp;
    const time = runtime * episodeCount;
    const watching = seasonWatched.status === "WATCHING" ? -1 : 0;

    await updateInfo(userId, 0, 0, time, episodeCount, 1, watching);
  }

  const serieWatchedId = watched.id;
  await updateSerieWatch(serieWatchedId, {
    seasonCount: serie.serie_data.seasons.length,
    status: "COMPLETED",
    ended: new Date(),
  });

  await updateInfoWatchComp(userId);
}

export async function removeAllSerie(
  userId: string,
  serieId: string,
  serie: Serie,
) {
  let serieData = await getTVSeried(serieId);
  if (serieData === null) {
    serieData = await getOrCreateTVSeries(serieId, serie);
  }
  const serieWatched = await getOrCreateTVSeriesWatched(serieId, userId);

  const seasonsWatched = await db.query.seasonWatchedTable.findMany({
    where: (season, { and, eq }) =>
      and(eq(season.userId, userId), eq(season.serieId, serieId)),
  });

  const {
    serie_data: { episode_run_time },
  } = serieData;
  let runtime = 40;

  if (episode_run_time[0] !== undefined) {
    runtime = episode_run_time[0];
  }

  for (const seasonWatched of seasonsWatched) {
    const record = await db
      .delete(seasonWatchedTable)
      .where(eq(seasonWatchedTable.id, seasonWatched.id))
      .returning();

    const seasonRecord = record[0];
    if (seasonRecord === undefined) continue;

    const { episodeWatched } = seasonRecord;
    const time = episodeWatched * runtime;
    const completed = seasonRecord.status === "COMPLETED" ? -1 : 0;
    const watching = seasonRecord.status === "WATCHING" ? -1 : 0;

    await updateInfo(userId, 0, 0, -time, -episodeWatched, completed, watching);
  }

  await db
    .delete(seriesWatchedTable)
    .where(eq(seriesWatchedTable.id, serieWatched.id));

  await updateInfoWatchComp(userId);
}
