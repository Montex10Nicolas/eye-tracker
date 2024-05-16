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
export async function MultiSearch(query: string) {
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

export async function GetMovieDetail(id: number) {
  "use server";
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

  const data = (await response.json()) as MovieDetail;
  return data;
}

export async function GetPersonDetail(id: number) {
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

export async function GetTVDetail(id: string) {
  "use server";

  const url = new URL(`/3/tv/${id}`, TMDB_URL);
  url.searchParams.set("append_to_response", "credits");

  const response = await fetch(url, {
    ...Headers,
  });

  const data: Serie = (await response.json()) as Serie;
  await getOrCreateTVSeries(data.id.toString(), data);
  return data;
}

export async function getTvRecomendation(tvId: number, page: number) {
  "use server";
  const id = tvId.toString();
  const url = new URL(`/3/tv/${id}/recommendations`, TMDB_URL);
  url.searchParams.set("page", page.toString());

  const response = await fetch(url, {
    ...Headers,
  });
  const data: unknown = await response.json();
  return data as Search<TVResultType>;
}

export async function getMovieRecomendation(movId: number, page: number) {
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
export async function getSeasonDetail(serieId: string, season_number: number) {
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
