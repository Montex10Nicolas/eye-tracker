import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { getUser, myInfo } from "~/app/(user)/action";
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

export default async function Page() {
  const user = await getUser();
  let info: Info;
  const LIMIT = 25;
  const offset = 0;

  if (user === null) {
    return <div>Not logged in</div>;
  } else {
    const temp = await myInfo(user.id);
    if (temp === undefined) {
      return <div>No info found</div>;
    }
    info = temp;
  }

  const myMovies = await myWatchedMovie(LIMIT, offset);
  if (myMovies === null) {
    return <div>Movies null</div>;
  }

  return (
    <main className="flex flex-col">
      <section className="m-4 rounded-md bg-white p-4 text-slate-950">
        <div>Movie count: {info.movieCountTotal}</div>
        <div className="flex ">
          Movie duration:
          {handleVisualizationMinute(
            info.movieDurationTotal + info.tvDurationTotal,
          )}
        </div>
      </section>
      <section className="m-4 flex flex-row flex-wrap gap-4 rounded-md bg-white p-4 text-black">
        {myMovies.map((watch) => {
          const check_movie = watch.movie?.movie_data;
          const user = watch.user;

          let movie: MovieDetail;
          let info: unknown;
          if (
            (check_movie !== undefined && check_movie !== null) ||
            user !== null
          ) {
            movie = check_movie as MovieDetail;
            if (user?.info !== null) {
              info = user?.info;
            } else {
              return (
                <div key={`${watch.userId}-${watch.movieId}`}>Info is null</div>
              );
            }
          } else {
            return (
              <div key={`${watch.userId}-${watch.movieId}`}>
                Something wrong
              </div>
            );
          }
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
        })}
      </section>
    </main>
  );
}
