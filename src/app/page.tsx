import { type User } from "lucia";
import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { Separator } from "~/components/ui/separator";
import { queryMoviePopular, queryTVPopular } from "~/server/queries";
import { getUser, myLatestSeries, myWatchedMovie } from "./(user)/user_action";

async function LatestSerie(props: { user: User }) {
  const { user } = props;
  const userId = user.id.toString();

  const series = await myLatestSeries(userId);

  function DisplaySeries() {
    if (series.length === 0) {
      return (
        <div className="flex w-full p-4 text-xl">
          <p>Start watch some Serie to keep track of them</p>
        </div>
      );
    }

    return (
      <section className="flex h-full flex-col">
        {series.map((serie) => {
          const serieData = serie.serie.serie_data;
          const { poster_path, name } = serieData;
          const updateAt = serie.updatedAt;

          return (
            <Link href={`/detail/tv/${serie.serieId}`} key={serie.id}>
              <div key={serie.id} className="m-2 flex flex-row bg-yellow-500">
                <div>
                  <Image
                    src={TMDB_IMAGE_URL(poster_path)}
                    alt={name}
                    width={100}
                    height={100}
                    className="h-[200px] w-[180px] p-1"
                  />
                </div>
                <div className="flex w-full flex-col justify-between py-1 text-xl">
                  <p>{name}</p>
                  <Separator orientation="horizontal" />
                  <p>{serie.status}</p>
                  <p>{updateAt.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    );
  }

  return (
    <div className="sm:w-[50%]">
      <div className="sticky top-0 bg-slate-700 p-2 text-xl">
        <h2>Serie</h2>
      </div>

      <div className="border-0 border-b-4 border-slate-950 sm:border-b-0 sm:border-r-4">
        <DisplaySeries />
      </div>
    </div>
  );
}

async function LatestMovie(props: { user: User }) {
  const { user } = props;
  const userId = user.id.toString();

  const movies = await myWatchedMovie(userId);

  function DisplayMovies() {
    if (movies.length === 0) {
      return (
        <div className="flex w-full p-4 text-xl">
          <p>Start watch some movie to keep track of them</p>
        </div>
      );
    }

    return (
      <section>
        {movies.map((movie) => {
          const { id, movie_data } = movie.movie;
          const { title, poster_path } = movie_data;
          const { updatedAt } = movie;

          return (
            <Link href={`/detail/movie/${movie.movieId}`} key={id}>
              <div className="m-2 flex flex-row bg-yellow-500">
                <div>
                  <Image
                    src={TMDB_IMAGE_URL(poster_path)}
                    alt={title}
                    width={100}
                    height={100}
                    className="h-[200px] w-[180px] p-1"
                  />
                </div>
                <div className="flex w-full flex-col justify-between py-1 text-lg">
                  <p>{title}</p>
                  <Separator orientation="horizontal" />
                  <p>{updatedAt.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    );
  }

  return (
    <div className="sm:w-[50%]">
      <div className="sticky bg-slate-700 p-2 text-xl">
        <h2>Movie</h2>
      </div>

      <div className="flex flex-col">
        <DisplayMovies />
      </div>
    </div>
  );
}

function DisplayNotLogged() {
  return (
    <div className="h-full w-full p-8 text-black">
      <p className="text-red-600">
        Log in to see the your latest serie and movie watched
      </p>
      <Link href="/login">
        <div role="button" className="mt-8 bg-sky-300 p-4 uppercase text-white">
          Go to login
        </div>
      </Link>
    </div>
  );
}

async function DisplayPopular() {
  const { results: seriesPopular } = await queryTVPopular();
  const { results: moviesPopular } = await queryMoviePopular();

  function Series() {
    return (
      <div>
        <h2 className="p-2 text-2xl">Serie: </h2>
        <div className="my-4 flex flex-row flex-wrap justify-around gap-4 gap-y-10 p-2">
          {seriesPopular.map((serie) => {
            const { id, name, poster_path, original_language, first_air_date } =
              serie;

            return (
              <div
                key={id}
                className="max-h-[250px] min-h-[250px] max-w-[150px]"
              >
                <Link href={`/detail/movie/${id}`}>
                  <div>
                    <Image
                      src={TMDB_IMAGE_URL(poster_path)}
                      alt="alt"
                      width={150}
                      height={250}
                      className="max-h-[200px] max-w-[150px]"
                    />
                  </div>
                  <div className="h-16">
                    <p>{name}</p>
                    <div className="flex justify-between">
                      <p>{original_language}</p>
                      <p>{displayHumanDate(first_air_date)}</p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function Movies() {
    return (
      <div>
        <h2 className="p-2 text-2xl">Movies: </h2>
        <div className="my-4 flex flex-row flex-wrap justify-around gap-4 gap-y-10 p-2">
          {moviesPopular.map((movie) => {
            const { id, title, poster_path, original_language, release_date } =
              movie;

            return (
              <div key={id} className="max-h-[250px] max-w-[150px]">
                <Link href={`/detail/movie/${id}`}>
                  <div>
                    <Image
                      src={TMDB_IMAGE_URL(poster_path)}
                      alt="alt"
                      width={150}
                      height={250}
                      className="max-h-[200px] max-w-[150px]"
                    />
                  </div>
                  <div className="text-wrap">
                    <p className="text-wrap">{title}</p>
                    <div className="flex justify-between">
                      <p>{original_language}</p>
                      <p>
                        {displayHumanDate(release_date.toLocaleLowerCase())}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto my-10 w-[90%]">
      <div className="flex h-16 items-center bg-slate-700 px-1  text-xl">
        <h1 className="bottom-0">Popular</h1>
      </div>
      <div className="flex flex-col sm:flex-row">
        <div className="w-full bg-red-500 sm:w-[50%]">{Series()}</div>
        <div className="w-full bg-blue-500 sm:w-[50%]">{Movies()}</div>
      </div>
    </div>
  );
}

export default async function Page() {
  const user = await getUser();
  const logged = user !== null;

  return (
    <main className="min-h-screen w-screen">
      <div className="">
        {logged ? (
          <div className="mx-auto mt-10 flex max-h-[800px] w-[90%]  flex-col overflow-auto bg-white sm:flex-row">
            <LatestSerie user={user} />
            <LatestMovie user={user} />
          </div>
        ) : (
          <DisplayNotLogged />
        )}
      </div>
      <DisplayPopular />
    </main>
  );
}
