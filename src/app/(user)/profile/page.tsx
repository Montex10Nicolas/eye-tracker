import Image from "next/image";
import Link from "next/link";
import { getOrCreateTVSeasonWatched } from "~/_utils/actions_helpers";
import { TMDB_IMAGE_URL, addZero } from "~/_utils/utils";
import {
  getUser,
  myInfo,
  myWatchedSeason,
  myWatchedSeries,
  type seasonWatchWithSeason,
} from "~/app/(user)/user_action";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type DBUserInfoType } from "~/server/db/types";
import { type User } from "~/types/tmdb_detail";
import { myWatchedMovie } from "../user_action";

function generic(n: number, divident: number): [number, number] {
  const whole = Math.floor(n / divident);
  const left = n % divident;
  return [whole, left];
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

function Summary(props: { user: User; info: DBUserInfoType | undefined }) {
  const { user, info } = props;
  return (
    <section className="mx-4  rounded-md bg-white p-4 text-slate-950">
      <div>{user.username}</div>

      {info !== undefined ? (
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
            <div>
              {handleVisualizationMinute(info.tvDurationTotal)} Duratoin
            </div>
            <div>{info.tvEpisodeCount} episodes</div>
            <div>{info.tvSerieCompleted} completed</div>
            <div>{info.tvSerieWatching} watching</div>
          </div>
        </section>
      ) : null}
    </section>
  );
}

async function DisplayMovie(props: { user: User }) {
  const { user } = props;
  const LIMIT = 25,
    offset = 0;
  const myMovies = await myWatchedMovie(user.id, LIMIT, offset);
  const hasMovies = myMovies.length !== 0;

  function DisplayMovie() {
    return myMovies.map((watch) => {
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
    });
  }

  return (
    <section className="m-4 rounded-md bg-white p-4 text-black">
      <h1 className="text-xl font-semibold">Movies:</h1>
      <ScrollArea>
        <div className="mt-2 flex flex-row flex-wrap gap-4">
          {hasMovies ? (
            <DisplayMovie />
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

async function DispalyAllSeries(props: { user: User }) {
  const { user } = props;
  const userId = user.id.toString();
  const seriesWatched = await myWatchedSeries(userId);

  function DisplaySeason(props: { season: seasonWatchWithSeason[] }) {
    const { season } = props;
    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Season</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Ended</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {season.map((ses) => {
              const started =
                ses.started === null
                  ? "not set"
                  : new Date(ses.started).toDateString();
              const ended =
                ses.ended === null
                  ? "not set"
                  : new Date(ses.ended).toDateString();
              return (
                <TableRow key={ses.id}>
                  <TableCell>
                    <div className="flex flex-col justify-center">
                      {ses.season.seasonName}
                      <Image
                        src={TMDB_IMAGE_URL(ses.season.season_data.poster_path)}
                        height={150}
                        width={50}
                        alt={ses.season.season_data.name}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{ses.status}</TableCell>
                  <TableCell>{started}</TableCell>
                  <TableCell>{ended}</TableCell>
                  <TableCell>
                    <div>
                      {ses.episodeWatched}/{ses.season.episodeCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/detail/tv/${ses.serieId}`}>Detail</Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </>
    );
  }

  function DisplaySeries() {
    return (
      <>
        {seriesWatched.map((serieWatch, index) => {
          const serieData = serieWatch.serie.serie_data;
          const seasonsWatched = serieWatch.seasonsWatched;

          return (
            <Accordion type="single" collapsible key={serieData.id}>
              <AccordionItem value={`serie-${index}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-4">
                    <Image
                      src={TMDB_IMAGE_URL(serieData.poster_path)}
                      width={50}
                      height={150}
                      alt={serieData.name}
                    />
                    <div>{serieData.name}</div>
                    <div>{serieWatch.status}</div>
                    <div>{serieWatch.started}</div>
                    <div>{serieWatch.started}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <DisplaySeason season={seasonsWatched} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </>
    );
  }

  return (
    <section className="mx-4 mt-3 rounded-md bg-white p-4 text-black">
      <div>
        <DisplaySeries />
      </div>
    </section>
  );
}

export default async function Page() {
  const user = await getUser();

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
  }

  const info = await myInfo(user.id);

  return (
    <main className="flex flex-col">
      <Summary user={user} info={info} />
      <DispalyAllSeries user={user} />
      <DisplayMovie user={user} />
    </main>
  );
}
