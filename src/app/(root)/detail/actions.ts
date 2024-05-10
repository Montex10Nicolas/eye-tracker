"use server";
import { and, asc, desc, eq } from "drizzle-orm";
import { watch } from "fs";
import { db } from "~/server/db";
import {
  moviesTable,
  userInfoTable,
  userTable,
  userToMovie,
} from "~/server/db/schema";
import { CODES_STATUS, type DBErorr } from "~/server/db/types";
import { type MovieDetail } from "~/types/tmdb_detail";

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
  const found = await db.query.moviesTable.findFirst({
    where: (mov, { eq }) => eq(mov.id, movie.id.toString()),
  });

  if (found === undefined) {
    console.log("dind't found adding");
    await addMovie(movie);
  } else {
    console.log("found");
  }

  try {
    await db.insert(userToMovie).values({
      movieId: movie.id.toString(),
      userId: userId,
      duration: movie.runtime,
      timeWatched: 1,
      dateWatched: new Date(),
    });
  } catch (e: unknown) {
    console.log("this user has already seen this movie");
  }

  try {
    const info = await db.query.userInfoTable.findFirst({
      where: (info, { eq }) => eq(info.userId, userId),
    });

    if (info === undefined) {
      console.log("info is undefinedd wtf");
      throw new Error("Info is undefined");
    } else {
      console.log("info is not undefined");
    }

    const count = info.movieCountTotal + 1;
    const duration = info.movieDurationTotal + movie.runtime;

    await db
      .update(userInfoTable)
      .set({ movieCountTotal: count, movieDurationTotal: duration })
      .where(eq(userInfoTable.id, info.id));
  } catch (e: unknown) {
    const err = e as DBErorr;
    console.log("already exist", err.code);
  }
}

export async function checkMovieWatched(userId: string, movieId: string) {
  return await db.query.userToMovie.findFirst({
    where: (mov, { eq }) =>
      and(eq(mov.userId, userId), eq(mov.movieId, movieId)),
  });
}

// This is complitely wrong
// It just delete all movie does not check the user that is making the request
export async function removeFromMovieWatched(userId: string, movieId: number) {
  "use server";
  return await db
    .delete(userToMovie)
    .where(
      and(
        eq(userToMovie.userId, userId),
        eq(userToMovie.movieId, movieId.toString()),
      ),
    );
}

export async function myWatchedMovie() {
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
  });

  return res;
}
