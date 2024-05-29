"use server";
<<<<<<< HEAD
import { and, eq } from "drizzle-orm";
=======
import { and, eq, sql, type SQL } from "drizzle-orm";
>>>>>>> temp-branch
import { revalidatePath } from "next/cache";
import {
  getOrCreateTVSeason,
  getOrCreateTVSeriesWatched,
<<<<<<< HEAD
  updateInfo,
  updateInfoWatchComp,
  updateOrCreateSeasonWatch,
=======
  getTVSeriesWatched,
  updateInfo,
  updateInfoWatchComp,
  updateOrCreateOrDeleteSeasonWatch,
  updateSeasonCompletitionByID,
  updateSeasonCompletitionByUser,
  updateSerieStatusWatch,
>>>>>>> temp-branch
} from "~/_utils/actions_helpers";
import { db } from "~/server/db";
import {
  movieWatchedTable,
  moviesTable,
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

<<<<<<< HEAD
  const serie: DBSerieWatchedType = await getOrCreateTVSeriesWatched(
    serieId,
    userId,
  );
=======
  const serie: DBSerieWatchedType | undefined = await getTVSeriesWatched(
    userId,
    serieId,
  );

  if (serie === undefined) {
    return undefined;
  }
>>>>>>> temp-branch

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
  status: StatusWatchedType;
<<<<<<< HEAD
=======
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
>>>>>>> temp-branch
}

export async function addEpisodeToSeasonWatched(
  userId: string,
  serie: Serie,
  season: Season,
  newInfo: UpdateSeasonWatchData,
) {
  const serieId = serie.id.toString(),
    seasonId = season.id.toString();
<<<<<<< HEAD

  console.log(serieId, seasonId, newInfo);

  await getOrCreateTVSeriesWatched(serieId, userId);
  await getOrCreateTVSeason(seasonId, season, serieId, serie.name);
  const [pre, post] = await updateOrCreateSeasonWatch(
=======

  await getOrCreateTVSeriesWatched(serieId, userId);
  await getOrCreateTVSeason(seasonId, season, serieId, serie.name);
  const [pre, post] = await updateOrCreateOrDeleteSeasonWatch(
>>>>>>> temp-branch
    seasonId,
    serieId,
    userId,
    newInfo,
  );

  if (pre === undefined || post === undefined) {
<<<<<<< HEAD
    throw new Error("I can this two be undefined");
  }

  console.log(pre, post);

  // UPDATE INFO AND SERIE WATCH
  const ep_diff = post.episodeWatched - pre.episodeWatched;

  // RUNTIME
  const ep_runtime = serie.episode_run_time[0];
  const DEFAULT_RUNTIME = 40;
  const runtime =
    ep_runtime === undefined ? DEFAULT_RUNTIME : ep_runtime * ep_diff;

  await updateInfo(userId, 0, 0, runtime, ep_diff, 0, 0);
=======
    throw new Error("How can this two be undefined");
  }

  // UPDATE INFO AND SERIE WATCH
  const ep_diff = post !== null ? post.episodeWatched : 0 - pre.episodeWatched;
>>>>>>> temp-branch

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
