import Image from "next/image";
import Link from "next/link";
import {
  NOT_FOUND_POSTER,
  TMDB_IMAGE_URL,
  displayHumanDate,
} from "~/_utils/utils";
import { MultiSearch } from "~/server/queries";
import {
  type MovieResultType,
  type PersonSearchType,
  type Search,
  type TVResultType,
} from "~/types/tmdb_detail";

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

function convertGender(gender: number) {
  switch (gender) {
    case 0:
      return "Male";
    case 1:
      return "Female";
    default:
      return "Not known";
  }
}

function DisplayPerson(props: {
  result: PersonSearchType;
  background_url: string;
}) {
  const { result: person, background_url } = props;

  return (
    <Link href={`/detail/person/${person.id}`}>
      <div className="max-w-[200px] cursor-pointer overflow-hidden bg-sky-600">
        <Image
          src={TMDB_IMAGE_URL(background_url)}
          width={200}
          height={300}
          alt={`Poster ${person.name}`}
          className="image object-fit min-h-[300px] min-w-[200px] overflow-hidden rounded-b-3xl transition-all duration-200 ease-in-out hover:relative hover:top-[-16px] hover:scale-110"
        />
        <div className="z-10 overflow-hidden p-2">
          <div>{person.name}</div>
          <div className="flex justify-between">
            <span>{convertGender(person.gender)}</span>
            <span>{person.known_for_department}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DisplayTV(props: { result: TVResultType; background_url: string }) {
  const { result: found, background_url } = props;
  return (
    <Link href={`/detail/tv/${found.id}`}>
      <div className="max-w-[200px] cursor-pointer overflow-hidden bg-sky-600 hover:border-yellow-600">
        <Image
          src={TMDB_IMAGE_URL(background_url)}
          width={500}
          height={300}
          alt={`Poster ${found.name}`}
          className="image min-h-[300px] min-w-[200px] overflow-hidden rounded-b-3xl object-cover transition-all duration-200 ease-in-out hover:relative hover:top-[-16px] hover:scale-110"
        />
        <div className="p-2">
          <div>{found.name}</div>
          <div className="flex justify-between">
            <span>First episode: {displayHumanDate(found.first_air_date)}</span>
            <span>{found.origin_country}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DisplayMovies(props: {
  result: MovieResultType;
  background_url: string;
}) {
  const { result: found, background_url } = props;
  return (
    <Link href={`/detail/movie/${found.id}`}>
      <div className="min-h-[300px] max-w-[200px] cursor-pointer overflow-hidden bg-sky-600 hover:border-yellow-600 ">
        <Image
          src={TMDB_IMAGE_URL(background_url)}
          width={500}
          height={300}
          alt={`Poster ${found.title}`}
          className="image min-h-[300px] min-w-[200px] overflow-hidden rounded-b-3xl object-cover transition-all duration-200 ease-in-out hover:relative hover:top-[-16px] hover:scale-110"
        />
        <div className="p-2">
          <div>{found.title}</div>
          <div className="flex justify-between">
            <span>Released in: {displayHumanDate(found.release_date)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Gets a string as a parameter and search with the multi query(person, movie and series)
// Need to add a filter
export default async function SearchPage(props: { params: { query: string } }) {
  const results = await MultiSearch(props.params.query);
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
