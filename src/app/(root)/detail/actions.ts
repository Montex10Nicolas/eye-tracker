"use server";
import { eq } from "drizzle-orm";
import { watch } from "fs";
import { db } from "~/server/db";
import { moviesTable, watchedMovie } from "~/server/db/schema";
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
    where: (mov, { eq }) => eq(mov.id, movie.id),
  });

  if (found === undefined) {
    await addMovie(movie);
  }

  try {
    await db.insert(watchedMovie).values({
      userId: userId,
      movieId: movie.id.toString(),
      duration: movie.runtime,
      timeWatched: 1,
      union: userId + movie.id.toString(),
    });
  } catch (e: unknown) {
    const err = e as DBErorr;
    console.log("already exist", err.code);
  }
}

export async function checkMovieWatched(userId: string, movieId: string) {
  return (
    await db.query.watchedMovie.findFirst({
      where: (mov, { eq }) => eq(mov.union, `${userId}${movieId}`),
    })
  )?.id;
}

export async function removeFromMovieWatched(watchedId: number) {
  const res = await db
    .delete(watchedMovie)
    .where(eq(watchedMovie.id, watchedId));

  console.log(res);
}
