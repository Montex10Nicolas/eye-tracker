"use server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
  episodeTable,
  episodeWatched,
  moviesTable,
  userInfoTable,
  userToMovie,
} from "~/server/db/schema";
import { type DBErorr } from "~/server/db/types";
import { getSeasonDetail } from "~/server/queries";
import {
  type Episode,
  type MovieDetail,
  type Season,
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

// This is complitely wrong
// It just delete all movie does not check the user that is making the request
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

export async function myWatchedMovie(limit = 25, offset: number) {
  "use server";
  const res = await db.query.userToMovie.findMany({
    with: {
      movie: true,
      user: {
        with: {
          info: true,
        },
      },
    },
    orderBy: desc(userToMovie.dateWatched),
    limit: limit,
    offset: offset,
  });

  return res;
}

// Given a season add all the episodes
export async function addWholeSeason(season: Season, serieId: string) {
  "use server";

  const detail = await getSeasonDetail(serieId, season.season_number);

  const { episodes } = detail;

  const final: unknown[] = [];
  for (const episode of episodes) {
    const res: {
      id: string;
      seasonId: string;
      episodeDate: unknown;
    }[] = await db
      .insert(episodeTable)
      .values({
        id: episode.id.toString(),
        episodeDate: episode,
        seasonId: season.id.toString(),
      })
      .returning();

    final.push(res[0]);
  }
  return final as {
    id: string;
    seasonId: string;
    episodeDate: unknown;
  }[];
}

export async function addSeasonToWatched(
  season: Season,
  userId: string,
  serieId: string,
) {
  "use server";

  const seasonId = season.id.toString();

  let epi = await db.query.episodeTable.findMany({
    where: (episode, { eq }) => eq(episode.seasonId, seasonId),
  });

  if (epi === undefined || epi.length === 0) {
    epi = await addWholeSeason(season, serieId);
  }

  const episodes = epi as {
    id: string;
    seasonId: string;
    episodeDate: Episode;
  }[];

  let runtime = 0;
  for (const episode of episodes) {
    const data = episode.episodeDate;

    const run = data.runtime;
    runtime = runtime + run;

    await db.insert(episodeWatched).values({
      userId: userId,
      episodeId: episode.id,
      duration: run,
    });
  }

  const userInfo = await db.query.userInfoTable.findFirst({
    where: (user, { eq }) => eq(userInfoTable.userId, userId),
  });

  if (userInfo === undefined) {
    throw new Error("Userinfo not found wtf");
  }

  const { id, tvCountTotal, tvDurationTotal } = userInfo;
  const newDuration = runtime + tvDurationTotal;
  const newCount = tvCountTotal + episodes.length;

  await db
    .update(userInfoTable)
    .set({
      tvDurationTotal: newDuration,
      tvCountTotal: newCount,
    })
    .where(eq(userInfoTable.id, id));
}
