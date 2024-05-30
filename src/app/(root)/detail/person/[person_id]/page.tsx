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
  return (
    <div className="flex w-full shrink flex-row rounded-md bg-white p-4 text-xl text-black">
      <Image
        className="max-h-[300px] shrink-0"
        src={`${TMDB_IMAGE_URL(person.profile_path)}`}
        alt={`Profile ${person.name}`}
        width={200}
        height={300}
      />

      <div className="m-4">
        <div className="flex h-14 items-center gap-4">
          <h2 className="shrink-0 text-xl font-bold">{person.name}</h2>
          <div className="text-sm text-slate-600/90">
            ({person.also_known_as.join(" - ")})
          </div>
        </div>
        <hr className="mb-3 h-2 bg-slate-900/80" />
        <div className="flex h-[90%] flex-col gap-2 py-2">
          <div>
            <span className="italic text-slate-400/80">Born in: </span>
            <span>{person.place_of_birth}</span>
          </div>
          <div>
            <span className="italic text-slate-400/80">DOB: </span>
            <span>{displayHumanDate(person.birthday)}</span>
            <span className="ml-2">
              {person.deathday === null
                ? `${ageCalculator(new Date(person.birthday), new Date())}yo`
                : displayHumanDate(person.deathday)}
            </span>
          </div>
          <div>
            <span className="italic text-slate-400/80">Gender: </span>
            <span>{numberToGender(person.gender)}</span>
          </div>
          <div className="mt-auto">{person.biography}</div>
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
            className="min-h-[250px]"
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
      <div className="items-around my-6 flex flex-col rounded-md bg-white p-4 text-base text-black">
        <h1 className="text-xl font-bold">Credits</h1>
        <hr className="h-2 bg-slate-900" />
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
    <main className="mx-auto w-[95%] sm:w-[85%] md:w-[70%]">
      {DisplayInfo(person)}
      {DisplayCreditsPerson(credits)}
    </main>
  );
}
