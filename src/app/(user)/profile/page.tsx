import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TMDB_IMAGE_URL, addZero } from "~/_utils/utils";
import {
  addEpisodeToSeasonWatched,
  addOrRemoveOneEpisode,
} from "~/app/(root)/detail/actions";
import { EditSeason } from "~/app/(root)/detail/tv/[tv_id]/_components/EditSeason";
import {
  getUser,
  myInfo,
  myWatchedSeries,
  type seasonWatchWithSeason,
} from "~/app/(user)/user_action";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Progress } from "~/components/ui/progress";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type DBUserInfoType } from "~/server/db/types";
import { type Serie, type User } from "~/types/tmdb_detail";
import { myWatchedMovie } from "../user_action";
import { SummaryGraph } from "./_components/SummaryGraph";

function generic(n: number, divident: number): [number, number] {
  const whole = Math.floor(n / divident);
  const left = n % divident;
  return [whole, left];
}

// Convert minutes into Days/Hours/Minutes
function handleVisualizationTimestamp(start: number) {
  const [toHours, minutes] = generic(start, 60);
  const [toDays, hours] = generic(toHours, 24);
  const [, days] = generic(toDays, 31);

  return (
    <div className="flex flex-wrap gap-2">
      {days > 0 ? <span>{days}d</span> : null}
      <span>{addZero(hours)}h</span>
      <span>{addZero(minutes)}m</span>
    </div>
  );
}

function Summary(props: { user: User; info: DBUserInfoType | undefined }) {
  const { user, info } = props;

  if (info === undefined) {
    redirect("/signin");
  }

  return (
    <section className="mx-4  rounded-md bg-white p-4 text-slate-950 md:h-[500px]">
      <h1 className="text-3xl font-bold">{user.username}</h1>

      {/*  Stats */}
      <div className="mx-auto my-2 flex h-20 w-full flex-row items-center justify-around rounded-sm bg-gray-800/90 px-6 py-2 text-xl text-white">
        <h1>
          {handleVisualizationTimestamp(
            info.movieDurationTotal + info.tvDurationTotal,
          )}
        </h1>
        <div>{info.tvEpisodeCount} Episodes</div>
        <div className="space-x-4">
          <span>
            {info.tvSerieCompleted +
              info.tvSeriePaused +
              info.tvSerieDropped +
              info.tvSeriePaused +
              info.tvSeriePlanned +
              info.tvSerieWatching}
          </span>
          <span>Series</span>
        </div>
        <div className="space-x-4">
          <span>
            {info.tvSeasonCompleted +
              info.tvSeasonPaused +
              info.tvSeasonDropped +
              info.tvSeasonPaused +
              info.tvSeasonPlanned +
              info.tvSeasonWatching}
          </span>
          <span>Seasons</span>
        </div>
      </div>

      <div className="">
        <SummaryGraph info={info} />
      </div>
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

  function DisplaySeason(props: {
    serie: Serie;
    season: seasonWatchWithSeason[];
  }) {
    const { serie, season } = props;

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
              <TableHead>Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {season.map((ses) => {
              const started =
                ses.started === null
                  ? "not set"
                  : new Date(ses.started).toLocaleDateString();
              ("default");
              const ended =
                ses.ended === null
                  ? "not set"
                  : new Date(ses.ended).toLocaleDateString();
              ("default");

              async function addOne() {
                "use server";
                const seasonID = ses.id;
                await addOrRemoveOneEpisode(userId, seasonID, serie, 1);
                revalidatePath("/profile");
              }
              async function removeOne() {
                "use server";
                const seasonID = ses.id;
                await addOrRemoveOneEpisode(userId, seasonID, serie, -1);
                revalidatePath("/profile");
              }

              return (
                <TableRow key={ses.id}>
                  <TableCell>
                    <div className="flex flex-col justify-center">
                      {ses.season.seasonName}
                      <Link
                        className="font-semibold text-blue-600 hover:underline"
                        href={`/detail/tv/${ses.serieId}`}
                      >
                        <Image
                          src={TMDB_IMAGE_URL(
                            ses.season.season_data.poster_path,
                          )}
                          height={150}
                          width={100}
                          alt={ses.season.season_data.name}
                        />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{ses.status}</TableCell>
                  <TableCell>{started}</TableCell>
                  <TableCell>{ended}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex w-full justify-between px-1">
                        <form>
                          <button
                            formAction={removeOne}
                            disabled={ses.episodeWatched === 0}
                            className="h-8 w-8 rounded-full bg-gray-600/20 p-1 hover:bg-gray-600/60"
                          >
                            -
                          </button>
                        </form>
                        {ses.episodeWatched}/{ses.season.episodeCount}
                        <form>
                          <button
                            formAction={addOne}
                            disabled={ses.status === "COMPLETED"}
                            className="h-8 w-8 rounded-full bg-gray-600/20 p-1 hover:bg-gray-600/60 disabled:bg-red-400/90"
                          >
                            +
                          </button>
                        </form>
                      </div>
                      <Progress
                        className="h-3 bg-blue-600"
                        value={
                          (ses.episodeWatched * 100) / ses.season.episodeCount
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex h-full w-full items-center justify-center bg-sky-600">
                      <EditSeason
                        addEpisode={addEpisodeToSeasonWatched}
                        serie={serie}
                        season={ses.season.season_data}
                        userId={user.id.toString()}
                        season_w={ses}
                      />
                    </div>
                  </TableCell>
                  <TableCell></TableCell>
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

          const started =
            serieWatch.started === null
              ? undefined
              : new Date(serieWatch.started).toLocaleDateString();
          const ended =
            serieWatch.ended === null
              ? undefined
              : new Date(serieWatch.ended).toLocaleDateString();

          return (
            <Accordion type="single" collapsible key={serieData.id}>
              <AccordionItem value={`serie-${index}`}>
                <AccordionTrigger>
                  <div className="flex w-full items-center gap-4">
                    <Image
                      src={TMDB_IMAGE_URL(serieData.poster_path)}
                      width={100}
                      height={250}
                      alt={serieData.name}
                    />
                    <div>{serieData.name}</div>
                    <div>{serieWatch.status}</div>
                    <div>{started !== undefined && `Started: ${started}`}</div>
                    <div>{ended !== undefined && `Ended: ${ended}`}</div>
                    <Link
                      className="ml-auto mr-6 font-semibold text-blue-600 hover:underline"
                      href={`/detail/tv/${serieData.id}`}
                    >
                      Detail
                    </Link>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <DisplaySeason serie={serieData} season={seasonsWatched} />
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
      <h1 className="text-xl font-semibold">Serie:</h1>
      <DisplaySeries />
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
