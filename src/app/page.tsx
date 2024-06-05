import { type User } from "lucia";
import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { Separator } from "~/components/ui/separator";
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
      <section className="flex flex-col">
        {series.map((serie) => {
          const serieData = serie.serie.serie_data;
          const { poster_path, name } = serieData;
          const updateAt = serie.updatedAt;

          return (
            <Link href={`/detail/tv/${serie.serieId}`} key={serie.id}>
              <div key={serie.id} className="m-4 flex flex-row bg-yellow-500">
                <div>
                  <Image
                    src={TMDB_IMAGE_URL(poster_path)}
                    alt={name}
                    width={100}
                    height={100}
                    className="p-1"
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
    <div className="relative max-h-[800px] min-h-[50%] w-full overflow-auto sm:h-full sm:min-h-96 sm:w-[50%]">
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
              <div className="m-4 flex flex-row bg-yellow-500">
                <div>
                  <Image
                    src={TMDB_IMAGE_URL(poster_path)}
                    alt={title}
                    width={100}
                    height={100}
                    className="p-1"
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
    <div className="relative max-h-[800px] min-h-[50%] w-full overflow-auto sm:h-full sm:min-h-96 sm:w-[50%]">
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

export default async function Page() {
  const user = await getUser();
  const logged = user !== null;

  return (
    <main className="w-screen">
      {logged ? (
        <div className="mx-auto mt-10 flex w-[90%] flex-col overflow-auto bg-white sm:flex-row">
          <LatestSerie user={user} />
          <LatestMovie user={user} />
        </div>
      ) : (
        <DisplayNotLogged />
      )}
    </main>
  );
}
