"use server";
import { and, desc, eq } from "drizzle-orm";
import { generateId, generateIdFromEntropySize } from "lucia";
import { db } from "~/server/db";
import {
  episodeTable,
  episodeWatched,
  moviesTable,
  seasonTable,
  seasonWatched,
  userInfoTable,
  userTable,
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
  const results = await db.query.userToMovie.findMany({
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

  return results;
}

// SEASONS

// Add season to DB
async function addSeason(season: Season) {
  "use server";
  const seasonId = season.id.toString();
  const returned = await db
    .insert(seasonTable)
    .values({
      id: seasonId,
      season_data: season,
    })
    .returning();
  return returned[0];
}

// Add all eps of a season to DB
async function addEpisodes(season: Season, serieId: string) {
  "use server";
  const seasonId = season.id.toString();
  const seasonDet = await getSeasonDetail(serieId, season.season_number);

  const episodes: { id: string; seasonId: string; episodeDate: Episode }[] = [];
  for (const episode of seasonDet.episodes) {
    const ep_id = episode.id.toString();

    const res = await db
      .insert(episodeTable)
      .values({
        id: ep_id,
        seasonId: seasonId,
        episodeDate: episode,
      })
      .returning();

    if (res[0] !== undefined) {
      console.log("\n\ninserting res\n\n");
    }
  }

  console.log("Final ", episodes);

  return episodes;
}

async function checkOrCreateTV(season: Season, serieId: string) {
  "use server";
  const seasonId = season.id.toString();

  let seasonDB = await db.query.seasonTable.findFirst({
    where: (ses, { eq }) => eq(seasonTable.id, seasonId),
  });

  if (seasonDB === undefined) {
    console.log("Season does not exist creating");
    seasonDB = await addSeason(season);
  }

  let episodes = await db.query.episodeTable.findMany({
    where: (epi, { eq }) => eq(episodeTable.seasonId, seasonId),
  });

  if (episodes === undefined || episodes.length < season.episode_count) {
    console.log("Episode don't exist or too short");
    episodes = await addEpisodes(season, serieId);
  }

  if (seasonDB === undefined || episodes === undefined) return null;

  return { seasonDB: seasonDB, episodes: episodes };
}

async function createTvWatched(
  seasonId: string,
  userId: string,
  serieId: string,
) {
  "use server";
  const id = generateId(32);
  console.log("Random id", id);

  const tvWatched = await db
    .insert(seasonWatched)
    .values({
      id: id,
      seasonId: seasonId,
      userId: userId,
      status: "watching",
      serieId: serieId,
    })
    .returning();

  if (tvWatched[0] === undefined) throw new Error("WTF");
  return tvWatched[0];
}

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

  for (const episode of episodes) {
    const episodeId = episode.id.toString();
    const data = episode.episodeDate;

    const id = generateId(32);

    await db.insert(episodeWatched).values({
      id: id,
      userId: userId,
      episodeId: episodeId,
      duration: data.runtime,
    });
  }

  await db
    .update(seasonWatched)
    .set({
      status: "completed",
    })
    .where(
      and(
        eq(seasonWatched.userId, userId),
        eq(seasonWatched.seasonId, seasonId),
      ),
    );
}

export async function addAllSeasonToWatched(
  season: Season,
  userId: string,
  serieId: string,
) {
  "use server";
  const seasonId = season.id.toString();

  const check = await checkOrCreateTV(season, serieId);
  if (check === null) {
    throw new Error("WTF");
  }

  const { seasonDB, episodes } = check;

  let watchSeason = await db.query.seasonWatched.findFirst({
    where: (mov, { eq, and }) =>
      and(eq(mov.seasonId, seasonId), eq(mov.userId, userId)),
  });
  // if it does not exist we need to create a new thing
  if (watchSeason === undefined) {
    watchSeason = await createTvWatched(seasonId, userId, serieId);
  }

  await db
    .update(seasonWatched)
    .set({
      status: "watching",
    })
    .where(eq(seasonWatched.seasonId, seasonDB.id));

  await addEpisodeToWatched(episodes, userId);
}

export async function myWatchedSeason(
  userId: string | undefined,
  serieId: string,
) {
  if (userId === undefined) return null;
  return await db.query.seasonWatched.findMany({
    where: (_, { eq }) =>
      and(eq(seasonWatched.userId, userId), eq(seasonWatched.serieId, serieId)),
  });
}
