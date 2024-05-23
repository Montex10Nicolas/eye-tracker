import Image from "next/image";
import Link from "next/link";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import {
  getLatestWatchedEpisodes,
  getUser,
  myInfo,
  type LatestWatchedEpisodes,
} from "~/app/(user)/user_action";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { type UserInfo } from "~/server/db/types";
import { type User } from "~/types/tmdb_detail";
import { myWatchedMovie } from "../user_action";

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

function Summary(props: { user: User; info: UserInfo }) {
  const { user, info } = props;
  return (
    <section className="mx-4  rounded-md bg-white p-4 text-slate-950">
      <div>{user.username}</div>

      <section className="flex flex-row justify-evenly gap-4">
        <div className="w-[40%] border border-slate-800">
          <h2>Movie count: {info.movieCountTotal}</h2>
          <div className="">
            Movie duration:
            {handleVisualizationMinute(info.movieDurationTotal)}
          </div>
        </div>

        <div className="w-[40%] border border-slate-800">
          <h2>Episodes:</h2>
          <div>{handleVisualizationMinute(info.tvDurationTotal)} Duratoin</div>
          <div>{info.tvEpisodeCount} episodes</div>
          <div>{info.tvSerieCompleted} completed</div>
          <div>{info.tvSerieWatching} watching</div>
        </div>
      </section>
    </section>
  );
}

async function DisplayMovie(props: { user: User }) {
  const { user } = props;
  const LIMIT = 25,
    offset = 0;
  const myMovies = await myWatchedMovie(user.id, LIMIT, offset);
  const hasMovies = myMovies.length !== 0;
  return (
    <section className="m-4 rounded-md bg-white p-4 text-black">
      <h1 className="text-xl font-semibold">Movies:</h1>
      <ScrollArea>
        <div className="mt-2 flex flex-row flex-wrap gap-4">
          {hasMovies ? (
            myMovies.map((watch) => {
              const movie = watch.movie.movie_data;

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
                        runtime:
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
              <h1>No movie found</h1>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

async function DisplayEpisode(props: { latest: LatestWatchedEpisodes }) {
  const { latest } = props;

  const { episode } = latest;
  const { season } = episode;

  return (
    <div className="w-40">
      <div>
        <Image
          src={TMDB_IMAGE_URL(episode.episodeDate.still_path)}
          width={250}
          height={250}
          alt={`${episode.episodeDate.name}`}
          className="aspect-video"
        />
      </div>

      <div className="">
        <span>{season.serieName}</span>
        <div className="space-x-2">
          <span className="ml-auto">{season.seasonName}</span>
          <span className="ml-auto">
            Episode: {episode.episodeDate.episode_number}
          </span>
        </div>
      </div>

      <div>{latest.watchedAt.toDateString()}</div>
    </div>
  );
}

async function DisplayEpisodes(props: { user: User }) {
  const { user } = props;
  const LIMIT = 25,
    offset = 0;
  const episodes = await getLatestWatchedEpisodes(user.id, LIMIT, offset);
  const hasTv = episodes.length !== 0;

  if (!hasTv) {
    return (
      <section>
        <div>You have no episode watched</div>
      </section>
    );
  }

  return (
    <section className="mx-4 rounded-md bg-white p-4 text-black">
      <h1 className="text-xl font-semibold">Latest watched episode:</h1>
      <ScrollArea>
        <div className="mt-2 flex h-60 gap-4">
          {episodes.map((episode) => (
            <DisplayEpisode key={episode.id} latest={episode} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

export default async function Page() {
  const user = await getUser();
  let info: UserInfo;
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
      throw new Error("Wtf if user is logged info should always exist");
    }
    info = temp;
  }

  return (
    <main className="flex flex-col">
      <Summary user={user} info={info} />
      <DisplayMovie user={user} />
      <DisplayEpisodes user={user} />
    </main>
  );
}
