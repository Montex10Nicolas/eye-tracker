"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  checkIfSeasonIsCompleted,
  checkIfSerieIsCompleted,
  createOrDeleteEpisodeWatched,
  getOrCreateEpisodes,
  getOrCreateFullTVData,
  getOrCreateTVSeason,
  getOrCreateTVSeasonWatched,
  getOrCreateTVSeriesWatched,
  updateInfo,
  updateInfoWatchComp,
  updateOrCreateSeasonWatch,
  updateOrCreateSerieWatch,
  updateSeasonWatch,
} from "~/_utils/actions_helpers";
import { db } from "~/server/db";
import {
  movieWatchedTable,
  moviesTable,
  userInfoTable,
} from "~/server/db/schema";
import {
  type DBErorr,
  type DBSeasonType,
  type DBSeasonWatchedType,
  type DBSerieWatchedType,
  type SerieType,
  type SerieWatchedType,
  type StatusWatchedType,
} from "~/server/db/types";
import {
  type Episode,
  type MovieDetail,
  type Season,
  type Serie,
} from "~/types/tmdb_detail";

export async function addMovie(movie: MovieDetail) {
  await db.insert(moviesTable).values({
    movie_data: movie,
    id: movie.id.toString(),
  });
}

export async function addToMovieWatched(
  userId: string,
  movie: MovieDetail,
  again: boolean,
) {
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

    const count = info.movieCountTotal + 1;
    const duration = info.movieDurationTotal + movie.runtime;

    await db
      .update(userInfoTable)
      .set({ movieCountTotal: count, movieDurationTotal: duration })
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
    const time = info.movieCountTotal - timeWatched;

    await db
      .update(userInfoTable)
      .set({
        movieCountTotal: runtime,
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

  const serie: DBSerieWatchedType = await getOrCreateTVSeriesWatched(
    serieId,
    userId,
  );

  const seasons = await db.query.seasonWatchedTable.findMany({
    where: (ses, { and, eq }) =>
      and(eq(ses.userId, userId), eq(ses.serieId, serieId)),
  });

  return {
    serie: serie,
    seasons: seasons,
  };
}

interface SeasonUpdate {
  date: Date | undefined;
  update: boolean;
}

export interface UpdateSeasonWatchData {
  episodeCount: number;
  status: StatusWatchedType;
}

export async function addEpisodeToSeasonWatched(
  userId: string,
  serie: Serie,
  season: Season,
  newInfo: UpdateSeasonWatchData,
) {
  const serieId = serie.id.toString(),
    seasonId = season.id.toString();

  console.log(serieId, seasonId, newInfo);

  await getOrCreateTVSeriesWatched(serieId, userId);
  await getOrCreateTVSeason(seasonId, season, serieId, serie.name);
  const [pre, post] = await updateOrCreateSeasonWatch(
    seasonId,
    serieId,
    userId,
    newInfo,
  );

  if (pre === undefined || post === undefined) {
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

  await updateInfo(
    userId,
    0,
    0,
    runtime,
    ep_diff,
    0,
    0,
  );

  await updateInfoWatchComp(userId);

  revalidatePath(`/detail/tv/${serie.id}`);
}

export async function addSeasonToWatched(
  season: Season,
  userId: string,
  serie: Serie,
  boolEp: boolean[],
  ep: SeasonUpdate[],
) {
  "use server";

  const data = await getOrCreateFullTVData(season, serie);
  let episodes_db = data.episodes;

  const seasonId = season.id.toString(),
    serieId = serie.id.toString();
  await updateOrCreateSeasonWatch(seasonId, serieId, userId, "watching", -1);
  await updateOrCreateSerieWatch(serieId, userId, "watching", -1);

  episodes_db = episodes_db.sort((a, b) => {
    const ep_num_a = a.episodeDate.episode_number;
    const ep_num_b = b.episodeDate.episode_number;
    return ep_num_a - ep_num_b;
  });

  // for (let i = 0; i < episodes_db.length; i++) {
  //   const ep = episodes_db[i]?.episodeDate;
  // }

  let index = 0;
  for (const value of boolEp) {
    const episode = episodes_db[index++];
    if (episode === undefined) continue;

    await createOrDeleteEpisodeWatched(
      userId,
      seasonId,
      episode.episodeDate,
      value,
    );
  }

  await getOrCreateTVSeriesWatched(serieId, userId);

  const { isSeasonCompleted, episodeCount } = await checkIfSeasonIsCompleted(
    userId,
    seasonId,
  );
  if (isSeasonCompleted) {
    await updateOrCreateSeasonWatch(
      seasonId,
      serieId,
      userId,
      "completed",
      episodeCount,
    );
  } else {
    await updateOrCreateSeasonWatch(
      seasonId,
      serieId,
      userId,
      "watching",
      episodeCount,
    );
  }

  const { completed: isSeriesCompleted, seasonCount } =
    await checkIfSerieIsCompleted(userId, serieId);
  if (isSeriesCompleted) {
    await updateOrCreateSerieWatch(serieId, userId, "completed", seasonCount);
  } else {
    await updateOrCreateSerieWatch(serieId, userId, "watching", seasonCount);
  }

  await updateInfoWatchComp(userId);

  revalidatePath(`/tv/detail/${serieId}`);
}

export async function returnEpisodesFromSeason(
  serieId: string,
  seasonId: string,
  season: Season,
  serieName: string,
) {
  await getOrCreateTVSeason(seasonId, season, serieId, serieName);

  const episodes = await getOrCreateEpisodes(serieId, seasonId, season);
  return episodes;
}
