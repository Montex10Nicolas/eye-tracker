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
export default async function SearchPage(props: { params: { query: string } }) {
  const results = await queryTMDBMultiSearch(props.params.query);
  results.results = sortByPopularity(results);

  return (
    <div className="m-4 flex flex-row flex-wrap justify-center gap-6 rounded-3xl bg-white p-8">
      {results.results.map((res) => {
        const background_image_url = res.backdrop_path
          ? res.backdrop_path
          : NOT_FOUND_POSTER;
        const background_poster = res.profile_path
          ? res.profile_path
          : NOT_FOUND_POSTER;

        switch (res.media_type) {
          case "movie":
            return (
              <DisplayMovies
                result={res}
                background_url={background_image_url}
              />
            );
          case "person":
            return (
              <DisplayPerson result={res} background_url={background_poster} />
            );
          case "tv":
            return (
              <DisplayTV result={res} background_url={background_image_url} />
            );
          default:
            return <div>something is missing and I do not know what</div>;
        }
      })}
    </div>
  );
}
