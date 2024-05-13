"use server";
import { and, desc, eq } from "drizzle-orm";
import { generateId, generateIdFromEntropySize } from "lucia";
import {
  getOrCreateFullTVData,
  getOrCreateTV,
  updateInfo,
} from "~/_utils/actions_helpers";
import { db } from "~/server/db";
import {
  episodeTable,
  episodeWatchedTable,
  moviesTable,
  seasonTable,
  seasonWatchedTable,
  seriesTable,
  seriesWatchedTable,
  userInfoTable,
  userTable,
  userToMovie,
} from "~/server/db/schema";
import {
  type DBErorr,
  type SeasonType,
  type SeasonsWatchedDB,
  type SerieDBType,
  type SeriesWatchedTableType,
  type UserInfo,
} from "~/server/db/types";
import { getSeasonDetail } from "~/server/queries";
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

// Add season to DB
// Add all eps of a season to DB

// Create all the DB for a serie and it's season

// Get a list of episode and add it to the Watch
async function addEpisodeToWatched(
  episodes: {
    id: string;
    seasonId: string;
    episodeDate: Episode;
  }[],
  userId: string,
) {
  "use server";
  const seasonId = episodes[0]?.seasonId;
  if (seasonId === undefined) throw new Error("fjdklfjsdkl action 277");

  const episode_count = episodes.length;
  let episode_runtime = 0;
  for (const episode of episodes) {
    const episodeId = episode.id.toString();
    const data = episode.episodeDate;

    const id = generateId(32);

    await db.insert(episodeWatchedTable).values({
      id: id,
      userId: userId,
      episodeId: episodeId,
      duration: data.runtime,
    });

    episode_runtime += data.runtime;
  }

  await updateInfo(userId, "add", 0, 0, episode_runtime, episode_count, 1, -1);

  // Add check if is completed
  await db
    .update(seasonWatchedTable)
    .set({
      status: "completed",
    })
    .where(
      and(
        eq(seasonWatchedTable.userId, userId),
        eq(seasonWatchedTable.seasonId, seasonId),
      ),
    );
}

export async function addSeasonToWatched(
  season: Season,
  userId: string,
  serie: TVDetail,
) {
  "use server";

  const all = await getOrCreateFullTVData(season, serie);
}
