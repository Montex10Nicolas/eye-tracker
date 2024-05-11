import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { getUser, myInfo } from "~/app/(user)/user_action";
import { type MovieDetail } from "~/types/tmdb_detail";
import { myWatchedMovie } from "../detail/actions";

// interface MyMovies {
//   id: number;
//   userId: string;
//   movieId: string;
//   union: string;
//   duration: number;
//   timeWatched: number;
//   dateWatched: Date;
//   user: {
//     username: string;
//   };
//   movie: MovieDetail;
// }

interface Info {
  id: string;
  userId: string | null;
  movieDurationTotal: number;
  movieCountTotal: number;
  tvDurationTotal: number;
  tvCountTotal: number;
}

function generic(n: number, divident: number): [number, number] {
  const whole = Math.floor(n / divident);
  const left = n % divident;
  return [whole, left];
}

function addZero(n: number) {
  return n > 10 ? n.toString() : "0" + n;
}

function handleVisualizationMinute(start: number) {
  const [toHours, minutes] = generic(start, 60);
  const [toDays, hours] = generic(toHours, 24);
  const [, days] = generic(toDays, 31);

  return (
    <div className="flex flex-wrap gap-2">
      {days > 0 ? <span>{days} days</span> : null}
      <span>{addZero(hours)}hours</span>
      <span>{addZero(minutes)}minutes</span>
    </div>
  );
}

function Summary(props: { info: Info }) {
  const { info } = props;
  return (
    <section className="m-4 rounded-md bg-white p-4 text-slate-950">
      <div>Movie count: {info.movieCountTotal}</div>
      <div className="flex ">
        Movie duration:
        {handleVisualizationMinute(
          info.movieDurationTotal + info.tvDurationTotal,
        )}
      </div>
    </section>
  );
}

export default async function Page() {
  const user = await getUser();
  let info: Info;
  const LIMIT = 25;
  const offset = 0;

  if (user === null) {
    return (
      <div className="m-4 rounded-md bg-white p-4 text-black">
        <p className="mx-auto text-xl">
          You need to be logged in to see your profile
        </p>
        <Link href={"/login"}>
          <button className="mt-4 w-full rounded-sm bg-sky-600 px-4 py-2 font-semibold uppercase text-white">
            go to login
          </button>
        </Link>
      </div>
    );
  } else {
    const temp = await myInfo(user.id);
    if (temp === undefined) {
      return <div>No info found</div>;
    }
    info = temp;
  }

  const myMovies = await myWatchedMovie(LIMIT, offset);
  const hasMovies = myMovies.length !== 0;

  return (
    <main className="flex flex-col">
      <Summary info={info} />
      <section className="m-4 flex flex-row flex-wrap gap-4 rounded-md bg-white p-4 text-black">
        {hasMovies ? (
          myMovies.map((watch) => {
            const movie = watch.movie.movie_data as MovieDetail;

            const [toHours, minutes] = generic(watch.duration, 60);
            const [, hours] = generic(toHours, 60);
            return (
              <div
                className="border-1 min-w-fit border border-black"
                key={`${watch.userId}-${watch.movieId}`}
              >
                <Link href={`/detail/movie/${watch.movieId}`}>
                  <Image
                    src={TMDB_IMAGE_URL(movie.poster_path)}
                    alt={`Poster ${movie.title}`}
                    width={150}
                    height={150}
                  />
                  <div className="p-1">
                    <div>{movie.title}</div>
                    <div className="">
                      runtime:{" "}
                      <span className="ml-auto">
                        {addZero(hours)}:{addZero(minutes)}
                      </span>
                    </div>
                    <div>
                      Watched: {watch.timeWatched} time{" "}
                      {watch.timeWatched > 1 ? "s" : ""}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })
        ) : (
          <div>
            <h1>Start add movies and series to track them</h1>
          </div>
        )}
      </section>
    </main>
  );
}
