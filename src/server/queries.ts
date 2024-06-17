import "server-only";
import { getOrCreateTVSeries } from "~/_utils/actions_helpers";
import {
  type MovieDetail,
  type MovieResultType,
  type PersonDetailType,
  type PersonSearchType,
  type Search,
  type SeasonDetail,
  type Serie,
  type TVResultType,
  type WatchProvider,
} from "~/types/tmdb_detail";

export const TMDB_URL = "https://api.themoviedb.org";
const TMDB_TOKEN = process.env.TMDB_TOKEN;

export const Authorization = `Bearer ${TMDB_TOKEN}`;

export const Headers = {
  headers: {
    Authorization: Authorization,
  },
};

export async function queryTMDBSearchTV(search: string) {
  "use server";
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
export async function queryTMDBMultiSearch(query: string) {
  "use server";
  const url = new URL("3/search/multi", TMDB_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("include_adult", "false");

  const response: Response = await fetch(url, {
    ...Headers,
    cache: "no-cache",
  });

  if (response.status !== 200) {
    throw new Error("Something wrong");
  }

  const data: unknown = await response.json();
  return data as Search<MovieResultType & PersonSearchType & TVResultType>;
}

export async function queryTMDBMovieDetail(id: number) {
  const url = new URL(`3/movie/${id}`, TMDB_URL);
  url.searchParams.set("append_to_response", "credits,images,videos");

  const response = await fetch(url, {
    headers: {
      Authorization: Authorization,
    },
  });

  if (response.status !== 200) {
    throw new Error("Something went wrong in queryTMDBMovieDetail");
  }

  const data = (await response.json()) as MovieDetail;
  return data;
}

export async function queryTMDBPersonDetail(id: number) {
  "use server";
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

export async function queryTMDBTVDetail(id: string) {
  "use server";

  const url = new URL(`/3/tv/${id}`, TMDB_URL);
  url.searchParams.set("append_to_response", "credits,keywords");

  const response = await fetch(url, {
    ...Headers,
  });

  const data: Serie = (await response.json()) as Serie;
  await getOrCreateTVSeries(data.id.toString(), data);
  return data;
}

export async function queryTMDBTVRecomendation(tvId: string, page: number) {
  const id = tvId.toString();
  const url = new URL(`/3/tv/${id}/recommendations`, TMDB_URL);
  url.searchParams.set("page", page.toString());

  const response = await fetch(url, {
    ...Headers,
  });
  const data: unknown = await response.json();
  return data as Search<TVResultType>;
}

export async function queryTMDBMovieRecomendation(movId: number, page: number) {
  const id = movId.toString();
  const url = new URL(`/3/movie/${id}/recommendations`, TMDB_URL);
  url.searchParams.set("page", page.toString());

  const response = await fetch(url, {
    ...Headers,
  });
  const data: unknown = await response.json();
  return data as Search<MovieResultType>;
}

// Get of a specified season all details including all the episodes
export async function queryTMDBSeasonDetail(
  serieId: string,
  season_number: number,
) {
  "use server";
  const seasonNum = season_number.toString();
  const url = new URL(`3/tv/${serieId}/season/${seasonNum}`, TMDB_URL);

  const response = await fetch(url, {
    ...Headers,
    cache: "no-cache",
  });

  const data: unknown = await response.json();
  return data as SeasonDetail;
}

export async function queryTMDBProvider(type: "tv" | "movie", id: number) {
  const url = new URL(`3/${type}/${id}/watch/providers`, TMDB_URL);
  const response = await fetch(url, {
    ...Headers,
  });

  return (await response.json()) as WatchProvider;
}

export async function queryTVPopular() {
  const url = new URL(`3/tv/popular`, TMDB_URL);
  const response = await fetch(url, {
    ...Headers,
    cache: "no-cache",
  });

  return (await response.json()) as Search<TVResultType>;
}

export async function queryMoviePopular() {
  const url = new URL(`3/movie/popular`, TMDB_URL);
  const response = await fetch(url, {
    ...Headers,
    cache: "no-cache",
  });

  return (await response.json()) as Search<MovieResultType>;
}
