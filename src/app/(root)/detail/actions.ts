"use server";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  checkIfSeasonIsCompleted,
  checkIfSerieIsCompleted,
  createEpisodesWatched,
  createOrDeleteEpisodeWatched,
  getOrCreateFullTVData,
  getOrCreateTVSeriesWatched,
  updateInfoWatchComp,
  updateOrCreateSeasonWatch,
  updateOrCreateSerieWatch,
} from "~/_utils/actions_helpers";
import { db } from "~/server/db";
import {
  episodeWatchedTable,
  moviesTable,
  seasonWatchedTable,
  userInfoTable,
  userToMovie,
} from "~/server/db/schema";
import {
  type DBErorr,
  type SeasonWatchedType,
  type SerieWatchedType,
} from "~/server/db/types";
import {
  type Episode,
  type MovieDetail,
  type Season,
  type TVDetail,
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
    await db.insert(userToMovie).values({
      movieId: movie.id.toString(),
      userId: userId,
      duration: movie.runtime,
      timeWatched: 1,
      dateWatched: new Date(),
    });
  } catch (e: unknown) {
    // Add update the watch count and duration
    const movieId = movie.id.toString();
    const record = await db.query.userToMovie.findFirst({
      where: (rec, { eq, and }) =>
        and(eq(rec.userId, userId), eq(rec.movieId, movieId)),
    });
    if (record === undefined) {
      throw new Error("Record does not exist and it should");
    }

    const time_watched = record.timeWatched + 1;
    await db
      .update(userToMovie)
      .set({
        timeWatched: time_watched,
      })
      .where(
        and(eq(userToMovie.userId, userId), eq(userToMovie.movieId, movieId)),
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
  }
}

export async function checkMovieWatched(userId: string, movieId: string) {
  return (
    (await db.query.userToMovie.findFirst({
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
      .delete(userToMovie)
      .where(
        and(
          eq(userToMovie.userId, userId),
          eq(userToMovie.movieId, movie.id.toString()),
        ),
      )
      .returning({
        timeWatched: userToMovie.timeWatched,
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

export async function myWatchedMovie(
  userId: string,
  limit = 25,
  offset: number,
) {
  "use server";
  const results = await db.query.userToMovie.findMany({
    with: {
      movie: true,
      user: {
        with: {
          info: true,
        },
      },
    },
    where: (user, { eq }) => eq(user.userId, userId),

    orderBy: desc(userToMovie.dateWatched),
    limit: limit,
    offset: offset,
  });

  return results;
}

export interface SeriesAndSeasons {
  serie: SerieWatchedType;
  seasons: SeasonWatchWithEpisodes[];
}

export interface SeasonWatchWithEpisodes {
  episode: {
    id: string;
    userId: string;
    duration: number;
    seasonId: string;
    episodeId: string;
    episode: {
      id: string;
      seasonId: string;
      episodeDate: Episode;
    };
  }[];
  id: string;
  userId: string;
  serieId: string;
  status: "not_started" | "watching" | "completed";
  seasonId: string;
}

// Return info about a series and it's season in relation to a user
export async function getUserWatchedTVAndSeason(
  userId: string | undefined,
  serieId: string,
) {
  if (userId === undefined) {
    return undefined;
  }

  const serie = await getOrCreateTVSeriesWatched(serieId, userId);

  const seasons = await db.query.seasonWatchedTable.findMany({
    where: (ses, { and, eq }) =>
      and(eq(ses.userId, userId), eq(ses.serieId, serieId)),
  });

  const seasonWatchWithEpisodes: SeasonWatchWithEpisodes[] = [];
  for (const season of seasons) {
    const s_id = season.seasonId.toString();

    const episode_watched = await db.query.episodeWatchedTable.findMany({
      where: (ep, { and, eq }) =>
        and(eq(ep.userId, userId), eq(ep.seasonId, s_id)),
      with: {
        episode: true,
      },
    });

    const a = {
      ...season,
      episode: episode_watched,
    };
    seasonWatchWithEpisodes.push(a);
  }

  return {
    serie,
    seasons: seasonWatchWithEpisodes,
  };
}

export async function myWatchedTV(userId: string, limit = 25, offset: number) {
  "use server";

  const results = await db.query.seasonWatchedTable.findMany({
    where: (sesWat, { eq }) => eq(seasonWatchedTable.userId, userId),
    with: {
      season: true,
    },
  });

  return results;
}

export async function myWatchedSeason(userId: string | undefined) {
  if (userId === undefined) return null;
  return await db.query.seasonWatchedTable.findMany({
    where: (_, { eq }) => eq(seasonWatchedTable.userId, userId),
  });
}

// Is episodesID = [] = add all episodes
// Otherwhise only add the
export async function addSeasonToWatched(
  season: Season,
  userId: string,
  serie: TVDetail,
  boolEp: boolean[],
) {
  "use server";

  const data = await getOrCreateFullTVData(season, serie);
  let episodes_db = data.episodes;

  const seasonId = season.id.toString(),
    serieId = serie.id.toString();
  await updateOrCreateSeasonWatch(seasonId, serieId, userId, "watching");
  await updateOrCreateSerieWatch(serieId, userId, "watching");

  episodes_db = episodes_db.sort((a, b) => {
    const ep_num_a = a.episodeDate.episode_number;
    const ep_num_b = b.episodeDate.episode_number;
    return ep_num_a - ep_num_b;
  });

  for (let i = 0; i < episodes_db.length; i++) {
    const ep = episodes_db[i]?.episodeDate;
    console.log(`${i}: ${episodes_db[i]?.id} ${ep?.id} ${ep?.episode_number}`);
  }

  let index = 0;
  for (const value of boolEp) {
    const episode = episodes_db[index++];
    console.log(
      `Index: ${index} ${episode?.id} ${episode?.episodeDate.episode_number}`,
    );
    if (episode === undefined) continue;

    await createOrDeleteEpisodeWatched(
      userId,
      seasonId,
      episode.episodeDate,
      value,
    );
  }

  await getOrCreateTVSeriesWatched(serieId, userId);

  const isSeasonCompleted = await checkIfSeasonIsCompleted(userId, seasonId);
  if (isSeasonCompleted) {
    await updateOrCreateSeasonWatch(seasonId, serieId, userId, "completed");
  } else {
    await updateOrCreateSeasonWatch(seasonId, serieId, userId, "watching");
  }

  const isSeriesCompleted = await checkIfSerieIsCompleted(userId, serieId);
  if (isSeriesCompleted) {
    await updateOrCreateSerieWatch(serieId, userId, "completed");
  } else {
    await updateOrCreateSerieWatch(serieId, userId, "watching");
  }

  await updateInfoWatchComp(userId);

  revalidatePath(`/tv/detail/${serieId}`);
}
