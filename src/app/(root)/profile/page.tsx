import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { getUser, myInfo } from "~/app/(user)/action";
import { type MovieDetail } from "~/types/tmdb_detail";
import { myWatchedMovie } from "../detail/actions";

interface MyMovies {
  id: number;
  userId: string;
  movieId: string;
  union: string;
  duration: number;
  timeWatched: number;
  dateWatched: Date;
  user: {
    username: string;
  };
  movie: MovieDetail;
}

interface Info {
  id: string;
  userId: string | null;
  movieDurationTotal: number;
  movieCountTotal: number;
  tvDurationTotal: number;
  tvCountTotal: number;
}

export default async function Page() {
  const user = await getUser();
  let info: Info;

  if (user === null) {
    ("use client");

    return <div>Not logged in</div>;
  } else {
    const temp = await myInfo(user.id);
    if (temp === undefined) {
      return <div>No info found</div>;
    }
    info = temp;
  }

  const myMovies = await myWatchedMovie();
  if (myMovies === null) {
    return <div>Movies null</div>;
  }

  return (
    <main className="flex flex-col">
      <div>
        <div>Movie count: {info.movieCountTotal}</div>
        <div>Movie duration: {info.movieDurationTotal}</div>
      </div>
      <div>
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

          return (
            <div key={`${watch.userId}-${watch.movieId}`}>
              <Link href={`/detail/movie/${watch.movieId}`}>
                <Image
                  src={TMDB_IMAGE_URL(movie.poster_path)}
                  alt={`Poster ${movie.title}`}
                  width={150}
                  height={150}
                />
                <div>{movie.title}</div>
                <div>{watch.duration} minutes</div>
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
