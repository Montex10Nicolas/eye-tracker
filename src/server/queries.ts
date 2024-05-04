import {
  type MovieDetail,
  type MovieResultType,
  type PersonSearchType,
  type Search,
  type TVResultType,
} from "~/types/tmdb";

export const TMDB_IMAGE_URL = function (
  width: number,
  height: number,
  image_url: string,
) {
  return `https://image.tmdb.org/t/p/original/${image_url}`;
  // return `https://image.tmdb.org/t/p/w${width}_and_h${height}_face/${image_url}`;
};
const TMDB_URL = "https://api.themoviedb.org";
const TMDB_TOKEN = process.env.TMDB_TOKEN;

const Authorization = `Bearer ${TMDB_TOKEN}`;

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
    throw new Error("Something wrong");
  }
  const data: unknown = await response.json();
  return data as PersonDetail;
}
