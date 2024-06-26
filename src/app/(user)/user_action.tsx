import { hash, verify } from "@node-rs/argon2";
import { desc } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cache } from "react";
import { lucia } from "~/lib/auth";
import { db } from "~/server/db";
import {
  seasonWatchedTable,
  seriesWatchedTable,
  userInfoTable,
  userTable,
} from "~/server/db/schema";
import {
  DRIZZLE_ERROR_CODE,
  type DBSeasonType,
  type DBSeasonWatchedType,
  type DBSerieType,
  type DBUserInfoType,
  type DrizzleDBError,
} from "~/server/db/types";
import { type MovieDetail } from "~/types/tmdb_detail";

export const PASSWORD_HASH_PAR = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export const getUser = cache(async () => {
  "use server";

  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (sessionId === null) return null;
  const { user, session } = await lucia.validateSession(sessionId);

  if (session === null) return null;

  try {
    if (session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!session) {
      const sessionsCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionsCookie.name,
        sessionsCookie.value,
        sessionsCookie.attributes,
      );
    }
  } catch {
    throw new Error("Error");
  }

  return user;
});

export async function signup(username: string, password: string) {
  "use server";
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-zA-Z0-9_-]+$/.test(username)
  ) {
    return new NextResponse("Invalid username", {
      status: 401,
    });
  }

  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return new NextResponse("invalid password", {
      status: 401,
    });
  }
  const passwordHash = await hash(password, { ...PASSWORD_HASH_PAR });
  const userId = generateIdFromEntropySize(10);

  try {
    await db.insert(userTable).values({
      username: username,
      password_hash: passwordHash,
      id: userId,
    });
  } catch (e: unknown) {
    const error = e as DrizzleDBError;

    const { code } = error;

    const message = DRIZZLE_ERROR_CODE[code];

    return new NextResponse(message ?? "Unknown error", {
      status: 401,
      statusText: message ?? "Unknown error",
    });
  }

  await db.insert(userInfoTable).values({
    userId: userId,
  });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

export async function login(username: string, password: string) {
  "use server";

  const user = await db.query.userTable.findFirst({
    where: (user, { eq }) => eq(user.username, username),
  });

  if (!user) {
    return new NextResponse("username or password wrong", {
      status: 401,
      statusText: "Username or password wrong",
    });
  }

  const validPassword = await verify(user.password_hash, password, {
    ...PASSWORD_HASH_PAR,
  });

  if (!validPassword) {
    return new NextResponse("Invalid email or password", {
      status: 401,
      statusText: "Wrong username or password",
    });
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

export async function Logout() {
  "use server";
  const user = await getUser();
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

  if (user === null || sessionId === null) {
    return redirect("/");
  }

  await lucia.invalidateSession(sessionId);
  // await lucia.invalidateUserSessions(user.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/login");
}

export async function myInfo(userId: string) {
  const info: DBUserInfoType | undefined =
    await db.query.userInfoTable.findFirst({
      where: (info, { eq }) => eq(info.userId, userId),
    });

  return info;
}

export type seasonWatchWithSeason = {
  season: DBSeasonType;
} & DBSeasonWatchedType;

export type SeriesAndSeasonWatched = typeof seriesWatchedTable.$inferSelect & {
  seasonsWatched: seasonWatchWithSeason[];
  serie: DBSerieType;
};

// Return all the season a user Watched
export async function myWatchedSeries(userId: string) {
  "use server";

  const results = await db.query.seriesWatchedTable.findMany({
    where: (sesWat, { eq }) => eq(sesWat.userId, userId),
    with: {
      serie: {
        with: {
          seasons: {
            with: {
              watchedBy: {
                where: (seasonW, { eq }) => eq(seasonW.userId, userId),
              },
            },
          },
        },
      },
    },
    orderBy: desc(seriesWatchedTable.updatedAt),
  });

  return results;
}

export async function myWatchedSeason(userId: string | undefined) {
  if (userId === undefined) return null;
  return await db.query.seasonWatchedTable.findMany({
    where: (_, { eq }) => eq(seasonWatchedTable.userId, userId),
  });
}

export interface MyMovieType {
  userId: string;
  movieId: string;
  duration: number;
  timeWatched: number;
  watchedAt: Date | null;
  movie: {
    id: string;
    movie_data: MovieDetail;
  };
}

export async function myWatchedMovie(userId: string, limit = 10, offset = 0) {
  "use server";
  const results = await db.query.movieWatchedTable.findMany({
    with: {
      movie: true,
    },
    where: (user, { eq }) => eq(user.userId, userId),

    limit: limit,
    offset: offset,
  });

  return results;
}

export async function myLatestSeries(userId: string, limit = 10, offset = 0) {
  "use server";
  const series = await db.query.seriesWatchedTable.findMany({
    with: {
      serie: true,
    },
    where: (serie, { eq }) => eq(serie.userId, userId),
    orderBy: desc(seriesWatchedTable.updatedAt),
    limit: limit,
    offset: offset,
  });

  return series;
}
