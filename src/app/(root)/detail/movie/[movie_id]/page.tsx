import { type User } from "lucia";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { getUser } from "~/app/(user)/user_action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  queryTMDBMovieDetail,
  queryTMDBMovieRecomendation,
} from "~/server/queries";
import { type Credits, type MovieDetail } from "~/types/tmdb_detail";
import { DisplayGenres } from "../../_components/Display";
import {
  addToMovieWatched,
  checkMovieWatched,
  removeFromMovieWatched,
} from "../../actions";

async function Info(props: { user: User | null; movie: MovieDetail }) {
  const { user, movie } = props;
  const logged = user !== null;
  const movieId = movie.id.toString();

  let watched = false;
  if (logged) {
    const userId = user.id.toString();
    watched = await checkMovieWatched(userId, movieId);
  }

  const {
    title,
    backdrop_path,
    budget,
    genres,
    id,
    origin_country,
    original_language,
    original_title,
    overview,
    poster_path,
    release_date,
    revenue,
    runtime,
    status,
    spoken_languages,
    production_companies,
    production_countries,
  } = movie;

  async function HandleButton() {
    const userId = user!.id.toString();
    async function add() {
      "use server";
      await addToMovieWatched(userId, movie);

      return revalidatePath(`/detail/movie/${id}`);
    }

    async function remove() {
      "use server";
      await removeFromMovieWatched(userId, movie);

      return revalidatePath(`/detail/movie/${id}`);
    }

    if (watched) {
      return (
        <div className="h-full w-full">
          <form action={remove} className="h-full w-full">
            <button className="h-full w-full items-center justify-center bg-red-500 font-semibold uppercase text-white">
              remove
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="h-full w-full">
        <form action={add} className="h-full w-full">
          <button
            type="submit"
            className="h-full w-full items-center justify-center bg-blue-500 font-semibold uppercase text-white"
          >
            add
          </button>
        </form>
      </div>
    );
  }

  return (
    <section className="w-full">
      {/* Background Image */}
      <div className="h-[200px] overflow-hidden sm:h-[300px]">
        <Image
          src={TMDB_IMAGE_URL(backdrop_path)}
          alt=""
          width={2000}
          height={300}
          className="w-full sm:-translate-y-24"
        />
      </div>

      {/* Info */}
      <div className="w-full flex-row sm:flex">
        <div className="relative min-w-36 sm:min-w-56 sm:max-w-56">
          {/* Poster */}
          <div className="absolute -top-40 left-1 h-[100px] w-[80px] sm:left-8 sm:h-[300px] sm:w-[200px]">
            <Image
              src={TMDB_IMAGE_URL(poster_path)}
              alt="alt"
              width={400}
              height={400}
              className="h-full"
            />
            {logged ? (
              <div className="h-12 w-full">{HandleButton()}</div>
            ) : null}
          </div>
        </div>

        <div className="ml-4 flex flex-col space-y-4 p-2">
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-3xl font-bold">{title}</h1>
            <span>|</span>
            <h3 className="text-xl">{original_title}</h3>
          </div>

          <div className="flex flex-row flex-wrap gap-4 gap-y-2 text-lg">
            <p>
              <span>Status: </span>
              <span>{status}</span>
            </p>
            <p>
              <span>Runtime: </span>
              <span>{runtime}</span>
            </p>
            <p>
              <span>Release Date: </span>
              <span>{displayHumanDate(release_date)}</span>
            </p>
            <p>
              <span>Origin Language: </span>
              <span>{original_language}</span>
            </p>
            <p>
              <span>Origin Country: </span>
              <span>{origin_country.join(" - ")}</span>
            </p>
            <p>
              <span>Languages: </span>
              <span className="space-x-2">
                {spoken_languages.map((lang) => (
                  <span key={lang.iso_639_1}>{lang.english_name}</span>
                ))}
              </span>
            </p>
            <p>
              <span>Production: </span>
              <span>{production_companies.map((company) => company.name)}</span>
            </p>
            <p>
              <span>Countries: </span>
              <span>{production_countries.map((country) => country.name)}</span>
            </p>
            <p>
              <span>Budget: </span>
              <span>{budget}</span>
            </p>
            <p>
              <span>Revenue: </span>
              <span>
                {revenue} ({revenue - budget})
              </span>
            </p>
          </div>
          <DisplayGenres genres={genres} />
          <p>{overview}</p>
        </div>
      </div>
    </section>
  );
}

async function Credits(props: { credits: Credits }) {
  const {
    credits: { cast: casts, crew: crews },
  } = props;

  function Cast() {
    return (
      <div className="flex flex-row flex-wrap justify-around gap-8">
        {casts.map((cast) => {
          const { name, profile_path, character, original_name } = cast;
          return (
            <div key={cast.id} className="w-32">
              <Link href={`/detail/person/${cast.id}`}>
                <div className="overflow-hidden">
                  <Image
                    src={TMDB_IMAGE_URL(profile_path ?? "")}
                    alt="alt"
                    width={200}
                    height={100}
                    className="transition-transform duration-500 ease-in-out hover:scale-125"
                  />
                </div>
                <div>
                  <p className="flex w-full flex-wrap space-x-2">
                    <span>{name}</span>
                    {original_name !== name ? (
                      <>
                        <span>|</span>
                        <span>{original_name}</span>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-4">
                    <span>{character}</span>
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    );
  }

  function Crew() {
    return (
      <div className="flex flex-row flex-wrap justify-around gap-8">
        {crews.map((crew) => {
          const { name, profile_path, department } = crew;

          return (
            <div key={crew.id} className="w-32">
              <Link href={`/detail/person/${crew.id}`}>
                <div>
                  <Image
                    src={TMDB_IMAGE_URL(profile_path ?? "")}
                    alt={name}
                    width={200}
                    height={100}
                    className="h-full w-full"
                  />
                </div>
                <div>
                  <p>{name}</p>
                  <p>{department}</p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto w-[90%]">
      <Tabs defaultValue="cast" className="w-full">
        <TabsList className="flex w-full bg-slate-800">
          <TabsTrigger className="w-[50%]" value="cast">
            <p className="font-semibold uppercase">cast</p>
          </TabsTrigger>
          <TabsTrigger className="w-[50%]" value="crew">
            <p className="font-semibold uppercase">crew</p>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cast">{Cast()}</TabsContent>
        <TabsContent value="crew">{Crew()}</TabsContent>
      </Tabs>
    </div>
  );
}

async function Reccomendations(props: { movie: MovieDetail }) {
  const { movie } = props;
  const movieId = movie.id;
  const { results } = await queryTMDBMovieRecomendation(movieId, 1);

  return (
    <div className="mx-auto mb-6 w-[90%] p-2">
      <h2 className="text-2xl">Reccomendations</h2>

      <div className="flex flex-row flex-wrap justify-around gap-8">
        {results.map((serie) => {
          const { id, title, poster_path, original_language, release_date } =
            serie;

          return (
            <div key={serie.id} className="max-w-[100px]">
              <Link href={`/detail/movie/${id}`}>
                <div className="h-[150px] max-h-[150px]">
                  <Image
                    src={TMDB_IMAGE_URL(poster_path)}
                    alt="alt"
                    width={100}
                    height={100}
                    className="max-h-full max-w-full"
                  />
                </div>
                <div className="text-wrap">
                  <p className="text-wrap">{title}</p>
                  <p className="flex justify-between">
                    <span>{original_language}</span>
                    <span>{displayHumanDate(release_date)}</span>
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function Page(props: { params: { movie_id: number } }) {
  const {
    params: { movie_id },
  } = props;
  const user = await getUser();
  const movieData = await queryTMDBMovieDetail(movie_id);

  return (
    <div className="mx-auto">
      <Info user={user} movie={movieData} />
      <hr className="my-4 w-full" />
      <Credits credits={movieData.credits} />
      <hr className="my-4 w-full" />
      <Reccomendations movie={movieData} />
    </div>
  );
}
