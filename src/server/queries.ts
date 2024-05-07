import { generateIdFromEntropySize } from "lucia";
import { lucia } from "~/lib/auth";
import {
  type MovieDetail,
  type MovieResultType,
  type PersonDetailType,
  type PersonSearchType,
  type Search,
  type TVDetail,
  type TVResultType,
} from "~/types/tmdb";
import { db } from "./db";
import { sessionTable, userTable } from "./db/schema";

export const TMDB_URL = "https://api.themoviedb.org";
const TMDB_TOKEN = process.env.TMDB_TOKEN;

export const Authorization = `Bearer ${TMDB_TOKEN}`;

export async function searchTV(search: string) {
  const url = new URL("3/search/tv", TMDB_URL);
  url.searchParams.set("query", search);

  const response: Response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  });

  if (response.status !== 200) {
    throw new Error("Something wrong");
  }

  const data: unknown = await response.json();
  return data as Search<TVResultType>;
}

// This search inclue Movie Series and Persons
export async function MultiSearch(query: string) {
  const url = new URL("3/search/multi", TMDB_URL);
  url.searchParams.set("query", query);

  const response: Response = await fetch(url, {
    headers: {
      Authorization: Authorization,
    },
  });

  if (response.status !== 200) {
    throw new Error("Something wrong");
  }

  const data: unknown = await response.json();
  return data as Search<MovieResultType & PersonSearchType & TVResultType>;
}

export async function GetMovieDetail(id: number) {
  const url = new URL(`3/movie/${id}`, TMDB_URL);
  url.searchParams.set("append_to_response", "credits,images,videos");

  const response = await fetch(url, {
    headers: {
      Authorization: Authorization,
    },
  });

  if (response.status !== 200) {
    throw new Error("Smething went wrong");
  }

  const data: unknown = await response.json();
  return data as MovieDetail;
}

export async function GetPersonDetail(id: number) {
  const url = new URL(`3/person/${id}`, TMDB_URL);
  url.searchParams.set("append_to_response", "movie_credits,tv_credits,images");

  const response = await fetch(url, {
    headers: {
      Authorization: Authorization,
    },
  });

  if (response.status !== 200) {
    throw new Error(
      `Something wrong, ${response.status}, ${response.statusText}`,
    );
  }
  const data: unknown = await response.json();
  return data as PersonDetailType;
}

export async function GetTVDetail(id: number) {
  const url = new URL(`/3/tv/${id}`, TMDB_URL);
  url.searchParams.set("append_to_response", "credits");

  const response = await fetch(url, {
    headers: {
      Authorization: Authorization,
    },
  });

  const data: unknown = await response.json();
  return data as TVDetail;
}

export async function RegisterAndCreateSession(
  username: string,
  password: string,
) {
  const id = generateIdFromEntropySize(22);
  const user = await db.insert(userTable).values({
    username: username,
    password: password,
    id: id,
  });

  if (!user) {
    throw new Error("idk something happend with the user creation");
  }

  const session = await lucia.createSession(id, { username: username });

  return session.id;
}
