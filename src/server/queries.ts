import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "~/app/(user)/action";
import { lucia } from "~/lib/auth";
import {
  type MovieDetail,
  type MovieResultType,
  type PersonDetailType,
  type PersonSearchType,
  type Search,
  type TVDetail,
  type TVResultType,
} from "~/types/tmdb_detail";

export const TMDB_URL = "https://api.themoviedb.org";
const TMDB_TOKEN = process.env.TMDB_TOKEN;

export const Authorization = `Bearer ${TMDB_TOKEN}`;

export const Headers = {
  headers: {
    Authorization: Authorization,
  },
};

export async function searchTV(search: string) {
  const url = new URL("3/search/tv", TMDB_URL);
  url.searchParams.set("query", search);

  const response: Response = await fetch(url, {
    ...Headers,
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
    ...Headers,
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
  "use server";
  const url = new URL(`/3/tv/${id}`, TMDB_URL);
  url.searchParams.set("append_to_response", "credits");

  const response = await fetch(url, {
    ...Headers,
  });

  const data: unknown = await response.json();
  return data as TVDetail;
}

export async function Logout() {
  "use server";
  console.log("logouthello???");
  const user = await getUser();
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

  console.log("check");
  if (user === null || sessionId === null) {
    console.log("failed");
    return redirect("/");
  }

  console.log("passed");
  await lucia.invalidateSession(sessionId);
  await lucia.invalidateUserSessions(user.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/login");
}
