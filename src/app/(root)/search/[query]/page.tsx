import { NOT_FOUND_POSTER } from "~/_utils/utils";
import { queryTMDBMultiSearch } from "~/server/queries";
import {
  type MovieResultType,
  type PersonSearchType,
  type Search,
  type TVResultType,
} from "~/types/tmdb_detail";
import {
  DisplayMovies,
  DisplayPerson,
  DisplayTV,
} from "../../detail/_components/Display";

// Probabli need to check with more series/movie/person that share names
function sortByPopularity(
  results: Search<MovieResultType & PersonSearchType & TVResultType>,
) {
  const array = results.results;
  const sorted = array.sort((a, b) => {
    const pop_a = a.popularity,
      pop_b = b.popularity;
    return pop_b - pop_a;
  });

  return sorted;
}

// Gets a string as a parameter and search with the multi query(person, movie and series)
// Need to add a filter
export default async function Page(props: { params: { query: string } }) {
  const results = await queryTMDBMultiSearch(props.params.query);
  const sorted = sortByPopularity(results);

  return (
    <main className="flex w-screen flex-row flex-wrap bg-fuchsia-900">
      {sorted.map((res) => {
        const background_image_url = res.poster_path
          ? res.poster_path
          : NOT_FOUND_POSTER;
        const background_poster = res.profile_path
          ? res.profile_path
          : NOT_FOUND_POSTER;

        const { media_type } = res;
        const display =
          media_type === "movie" ? (
            <DisplayMovies result={res} background_url={background_image_url} />
          ) : "tv" ? (
            <DisplayTV result={res} background_url={background_image_url} />
          ) : (
            <DisplayPerson result={res} background_url={background_poster} />
          );

        return (
          <div className="mx-auto h-[300px] w-[150px] sm:mx-0" key={res.id}>
            {display}
          </div>
        );
      })}
    </main>
  );
}
