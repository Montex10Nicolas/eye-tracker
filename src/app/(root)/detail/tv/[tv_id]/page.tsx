import Image from "next/image";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { getUser } from "~/app/(user)/user_action";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import {
  type DBSeasonWatchedType,
  type DBSerieWatchedType,
} from "~/server/db/types";
import { queryTMDBProvider, queryTMDBTVDetail } from "~/server/queries";
import { type Season, type Serie, type User } from "~/types/tmdb_detail";
import { DisplayCredits, DisplayGenres } from "../../_components/Display";
import { AddIcon, TrashIcon } from "../../_components/Icons";
import Provider from "../../_components/Providers";
import {
  addEpisodeToSeasonWatched,
  getUserWatchedTVAndSeason,
  type SeriesAndSeasonsWatched,
} from "../../actions";
import { EditSeason } from "./_components/EditSeason";

async function DisplayInfo(props: {
  tv: Serie;
  serieWatched: DBSerieWatchedType | undefined;
}) {
  const { tv } = props;
  const back_url = tv.backdrop_path;
  const poster_url = tv.poster_path;
  const tvId = tv.id;

  const providers = await queryTMDBProvider("tv", tvId);

  return (
    <section className="relative flex flex-row gap-4 overflow-hidden rounded-md border border-white bg-transparent p-4 text-white">
      <div className="flex max-w-40 shrink-0 flex-col gap-2">
        <div className="min-w-[50%]">
          <Image
            src={TMDB_IMAGE_URL(poster_url)}
            width={130}
            height={130}
            alt={tv.name}
            priority
            className="w-full object-cover"
          />
          <div className="mt-2">
            <Provider providers={providers.results} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="mb-2 space-x-2">
          <span className="font-bold">{tv.name}</span>
          <span>|</span>
          <span className="italic text-slate-400">{tv.status}</span>
        </div>

        <div className="flex flex-col flex-wrap gap-3">
          <div className="flex w-full flex-row flex-wrap justify-start gap-x-4 gap-y-2 md:w-[70%]">
            <p>
              <span className="italic text-slate-300">Language(s): </span>
              <span>{tv.languages.join("-").toUpperCase()}</span>
            </p>
            <p>
              <span className="italic text-slate-300">Runtime: </span>
              <span>{tv.episode_run_time}</span>m
            </p>
            <p>
              <span className="italic text-slate-300">Episodes: </span>
              <span>{tv.number_of_episodes}</span>
            </p>
            <p>
              <span className="italic text-slate-300">Seasons: </span>
              <span>{tv.number_of_seasons}</span>
            </p>
            <p>
              <span className="italic text-slate-300">From: </span>
              <span>{displayHumanDate(tv.first_air_date)}</span>
            </p>
            <p>
              <span className="italic text-slate-300"> To: </span>
              <span>{displayHumanDate(tv.last_air_date)}</span>
            </p>
          </div>
        </div>

        <div>
          <DisplayGenres genres={tv.genres} />
        </div>

        <p className="mb-2 mt-auto">
          <span className=" text-slate-300">Overview: </span> {tv.overview}
        </p>
      </div>

      {/* Backgroun image */}
      <img
        src={TMDB_IMAGE_URL(back_url)}
        alt={tv.name}
        className="absolute left-0 top-0 -z-10 h-full w-full object-cover opacity-40"
      />
    </section>
  );
}

async function DisplaySeason(props: {
  user: User | null;
  tv: Serie;
  seasons: Season[];
  seasonsWatched: DBSeasonWatchedType[] | undefined;
}) {
  const { seasons, user, tv, seasonsWatched } = props;
  const loggedIn = user !== null;

  // Position specials at the end of the list
  if (seasons[0]?.name.toLocaleLowerCase() === "specials") {
    const special = seasons.shift();
    if (special !== undefined) {
      seasons.push(special);
    }
  }

  return (
    <section className="mt-4 rounded-md bg-white p-4 text-black">
      <h1 className="text-xl font-semibold">Season</h1>
      <hr className="h-2 w-full bg-black fill-black" />

      <section className="mt-4">
        <ScrollArea className="h-[630px]">
          <div className="flex flex-row flex-wrap justify-start gap-4">
            {seasons.map((season) => {
              const watchedS = seasonsWatched?.find(
                (s) => s.seasonId === season.id.toString(),
              );
              const userId = user?.id.toString();

              async function addAll() {
                "use server";
                if (userId === undefined) return;
                await addEpisodeToSeasonWatched(userId, tv, season, {
                  episodeCount: season.episode_count,
                  status: "COMPLETED",
                  ended: new Date(),
                });
              }

              async function removeAll() {
                "use server";
                if (userId === undefined) return;
                await addEpisodeToSeasonWatched(userId, tv, season, {
                  episodeCount: -1,
                  status: null,
                  started: null,
                  ended: null,
                });
              }

              return (
                <div
                  key={season.id}
                  className="flex flex-col bg-slate-900 text-white"
                >
                  <h3 className="py-1 text-center text-xl">{season.name}</h3>
                  <div className="sticky">
                    <Image
                      src={TMDB_IMAGE_URL(season.poster_path)}
                      width={150}
                      height={300}
                      alt={`Poster ${season.name}`}
                      className="object-fill"
                    />
                    <div className="absolute right-1 top-1 flex w-fit flex-col rounded-sm bg-white p-1 text-xs font-bold text-black">
                      <p>{watchedS?.status}</p>
                      <p className="ml-auto">
                        {watchedS !== undefined &&
                        watchedS.status !== "PLANNING" &&
                        watchedS.status !== "COMPLETED" ? (
                          <>
                            <span>{watchedS.episodeWatched}</span> /
                            <span>{season.episode_count}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  {loggedIn ? (
                    <div className="mt-auto flex h-12 flex-row justify-around">
                      {watchedS?.status != "COMPLETED" ? (
                        <form
                          className="flex h-full w-full items-center justify-center bg-green-600"
                          action={addAll}
                        >
                          <button className="flex h-full w-full items-center justify-center bg-green-600">
                            <AddIcon />
                          </button>
                        </form>
                      ) : null}

                      <div className="flex h-full w-full items-center justify-center bg-sky-600">
                        <EditSeason
                          addEpisode={addEpisodeToSeasonWatched}
                          serie={tv}
                          season={season}
                          userId={user.id.toString()}
                          season_w={watchedS}
                        />
                      </div>
                      {watchedS?.status != null && watchedS != undefined ? (
                        <form
                          className="flex h-full w-full items-center justify-center bg-red-600"
                          action={removeAll}
                        >
                          <button className="flex h-full w-full items-center justify-center bg-red-600">
                            <TrashIcon />
                          </button>
                        </form>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </section>
    </section>
  );
}

export default async function Page(props: { params: { tv_id: string } }) {
  const tv_id = props.params.tv_id;

  const tv = await queryTMDBTVDetail(tv_id);
  const user = await getUser();

  const userId = user?.id;

  const seriesAndSeasonWatched: SeriesAndSeasonsWatched | undefined =
    await getUserWatchedTVAndSeason(userId, tv_id);

  return (
    <div className="mx-auto mb-6 mt-4 w-[75%] text-black">
      <DisplayInfo tv={tv} serieWatched={seriesAndSeasonWatched?.serie} />
      <DisplaySeason
        user={user}
        tv={tv}
        seasons={tv.seasons}
        seasonsWatched={seriesAndSeasonWatched?.seasons}
      />
      <DisplayCredits credits={tv.credits} />
    </div>
  );
}
