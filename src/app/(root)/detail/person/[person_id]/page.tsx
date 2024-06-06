import Image from "next/image";
import Link from "next/link";
import {
  NOT_FOUND_POSTER,
  TMDB_IMAGE_URL,
  ageCalculator,
  displayHumanDate,
  numberToGender,
} from "~/_utils/utils";
import {
  getUser,
  myWatchedMovie,
  myWatchedSeries,
  type SeriesAndSeasonWatched,
} from "~/app/(user)/user_action";
import { queryTMDBPersonDetail } from "~/server/queries";
import {
  type MovieCredits,
  type PersonDetailType,
  type PersonsCast,
  type TvCredits,
} from "~/types/tmdb_detail";
import { DisplayGenres } from "../../_components/Display";

function mergeCredits(movie: MovieCredits, tv: TvCredits): PersonsCast[] {
  const all = [...movie.cast, ...movie.crew, ...tv.cast, ...tv.crew];

  if (all[0] === undefined) return all;
  const removed_duplicate = [all[0]];
  for (let i = 1; i < all.length; i++) {
    const new_item = all[i];

    if (new_item === undefined) continue;

    const found = removed_duplicate.find((a) => {
      if (a.id === new_item.id) return a;
    });
    if (found === undefined) {
      removed_duplicate.push(new_item);
    }
  }

  // Check the data using the movie or tv proprierty
  function getData(person: PersonsCast) {
    return person.first_air_date
      ? new Date(person.first_air_date)
      : person.release_date
        ? new Date(person.release_date)
        : new Date();
  }

  const sorted = removed_duplicate.sort((a, b) => {
    const date_a: Date = getData(a),
      date_b: Date = getData(b);

    return date_b.getTime() - date_a.getTime();
  });

  return sorted;
}

function DisplayInfo(person: PersonDetailType) {
  const {
    name,
    also_known_as,
    birthday,
    deathday,
    gender,
    biography,
    place_of_birth,
    profile_path,
  } = person;

  return (
    <div className="mx-auto w-[90%]">
      {/* Profile */}
      <div className="flex w-full flex-row">
        <div className="h-[200px] w-[150px] shrink-0 sm:h-[300px] sm:w-[200px]">
          <Image
            src={TMDB_IMAGE_URL(profile_path)}
            alt={`Profile ${name}`}
            width={300}
            height={200}
            className="h-full w-full"
          />
        </div>

        <div className="ml-6 flex flex-col text-lg">
          <div className="flex items-center gap-4">
            <h1 className="min-w-fit text-3xl font-semibold">{name}</h1>
            <div className="space-x-2 text-xl">
              {also_known_as.map((name, idx) => (
                <span key={name}>
                  {name}
                  {idx > 0 ? " - " : ""}
                </span>
              ))}
            </div>
          </div>
          <hr className="my-4 w-full" />
          <div className="flex flex-row flex-wrap gap-8">
            <p>
              <span>Gender: </span>
              <span>{numberToGender(gender)}</span>
            </p>
            <p>
              <span>Place of Birth: </span>
              <span>{place_of_birth}</span>
            </p>
            <p>
              <span>Birthday: </span>
              <span>{displayHumanDate(birthday)}</span>
            </p>
            <p>
              <span>{deathday === null ? "Age: " : "Death: "}</span>
              <span>
                {deathday ?? ageCalculator(new Date(birthday), new Date())}
              </span>
            </p>
          </div>
          <p className="mt-auto">{biography}</p>
        </div>
      </div>
    </div>
  );
}

function DisplayCredit(
  cred: PersonsCast,
  movie: boolean,
  url_image: string,
  watched = false,
) {
  return (
    <Link
      key={cred.id}
      href={movie ? `/detail/movie/${cred.id}` : `/detail/tv/${cred.id}`}
    >
      <div
        className={`flex h-full max-w-48 cursor-pointer flex-col border p-2 ${watched ? "border-4 border-amber-500" : "border-red"}`}
      >
        <div className="relative">
          <Image
            src={url_image}
            width={192}
            height={250}
            alt={`${cred.original_title}`}
            className="min-h-[250px] object-cover"
          />
          <div className="absolute right-1 top-1 rounded-sm bg-white px-2 py-1 font-semibold uppercase text-black">
            {movie ? "Movie" : "TV"}
          </div>
        </div>
        <div className="font-bold">
          {cred.title ?? cred.title} {cred.name ?? cred.name} {"\n"}
        </div>
        <div className="max-w bottom-0 flex flex-col">
          <span>{cred.character}</span>
          <div className="flex justify-between">
            <span>
              {cred.release_date !== undefined
                ? displayHumanDate(cred.release_date)
                : cred.first_air_date !== undefined
                  ? displayHumanDate(cred.first_air_date)
                  : null}
            </span>
            <span>{cred.vote_average.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

async function DisplayCreditsPerson(credits: PersonsCast[]) {
  const user = await getUser();

  // Get all the Movie/Series that the user has watched
  if (user) {
    const userId = user.id.toString();
    const mySeries = await myWatchedSeries(userId);
    const myMovies = await myWatchedMovie(userId);

    const serieWatched = mySeries.flatMap((serie) => {
      const arr: SeriesAndSeasonWatched[] = [];
      for (const cred of credits) {
        if (cred.id.toString() === serie.serieId) {
          arr.push(serie);
        }
      }
      return arr;
    });

    const moviesWatched = myMovies.flatMap((movie) => {
      const arr: (typeof movie)[] = [];
      for (const cred of credits) {
        if (cred.id.toString() === movie.movieId) {
          arr.push(movie);
        }
      }
      return arr;
    });

    return (
      <div className="">
        <h1 className="text-xl font-bold">Credits</h1>
        <div className="mt-4 flex flex-row flex-wrap justify-around gap-4">
          {credits.map((cred) => {
            const movie = cred.release_date !== undefined;
            const url_image = cred.poster_path
              ? TMDB_IMAGE_URL(cred.poster_path)
              : NOT_FOUND_POSTER;

            const found =
              serieWatched.find(
                (serie) => serie.serieId === cred.id.toString(),
              ) !== undefined ||
              moviesWatched.find(
                (movie) => movie.movieId === cred.id.toString(),
              ) !== undefined;

            return DisplayCredit(cred, movie, url_image, found);
          })}
        </div>
      </div>
    );
  } else {
    return (
      <div className="items-around my-6 flex flex-row flex-wrap justify-around gap-4 rounded-md bg-white p-4 text-base text-black">
        {credits.map((cred) => {
          const movie = cred.release_date !== undefined;
          const url_image = cred.poster_path
            ? TMDB_IMAGE_URL(cred.poster_path)
            : NOT_FOUND_POSTER;

          return DisplayCredit(cred, movie, url_image);
        })}
      </div>
    );
  }
}

export default async function Page(props: { params: { person_id: number } }) {
  const person = await queryTMDBPersonDetail(props.params.person_id);
  const credits = mergeCredits(person.movie_credits, person.tv_credits);

  return (
    <main className="mb-8 mt-8 w-screen">
      {DisplayInfo(person)}
      <hr className="my-2 w-full" />
      {DisplayCreditsPerson(credits)}
    </main>
  );
}
