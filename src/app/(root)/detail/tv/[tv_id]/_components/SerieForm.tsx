"use client";

<<<<<<< HEAD
import { markCurrentScopeAsDynamic } from "next/dist/server/app-render/dynamic-rendering";
import Image from "next/image";
import { useRouter } from "next/navigation";
=======
import Image from "next/image";
>>>>>>> c8f9662 (broken)
import { useContext, useEffect, useState } from "react";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { type StatusWatchedType } from "~/server/db/types";
import { type Serie } from "~/types/tmdb_detail";
import {
<<<<<<< HEAD
  type SeriesAndSeasonsWatched,
  type markSeriesAsCompleted,
  type removeAllSerie,
  type updateSerieData,
=======
  updateSerieData,
  type SeriesAndSeasonsWatched,
  type markSeriesAsCompleted,
  type removeAllSerie,
>>>>>>> c8f9662 (broken)
} from "../../../actions";
import { CloseContext } from "./EditSeason";

const StatusTypes: StatusWatchedType[] = [
  "PLANNING",
  "WATCHING",
  "COMPLETED",
  "DROPPED",
  "PAUSED",
] as const;

export function SerieForm(props: {
  serie: Serie;
  season_watched: SeriesAndSeasonsWatched | undefined;
  userId: string;
<<<<<<< HEAD
  markCompleted: typeof markSeriesAsCompleted;
  removeAllSerie: typeof removeAllSerie;
  updateSerie: typeof updateSerieData;
=======
  updateSerie?: typeof updateSerieData;
  markAsCompleted?: typeof markSeriesAsCompleted;
  removeSerie?: typeof removeAllSerie;
>>>>>>> c8f9662 (broken)
}) {
  const {
    serie,
    season_watched,
    userId,
<<<<<<< HEAD
    markCompleted,
    removeAllSerie,
    updateSerie,
=======
    updateSerie,
    markAsCompleted,
    removeSerie,
>>>>>>> c8f9662 (broken)
  } = props;
  const { name, poster_path, number_of_episodes, number_of_seasons, seasons } =
    serie;

<<<<<<< HEAD
  const router = useRouter();
=======
>>>>>>> c8f9662 (broken)
  const context = useContext(CloseContext);
  const serieId = serie.id.toString();

  let episodeWatched = 0;
  const [seasonWatched, setSeason] = useState<boolean[]>(() => {
    const result = new Array<boolean>(number_of_seasons).fill(false);
    if (season_watched === undefined) {
      return result;
    }
    const { seasons: season_w } = season_watched;
    for (let i = 0; i < seasons.length; i++) {
      const season = seasons[i];
      if (season === undefined) continue;
      const sW = season_w.find((x) => x.seasonId === season.id.toString());

      const found = sW && sW.status === "COMPLETED";

      if (found) {
        result[i] = true;
        episodeWatched += season.episode_count;
      }
    }
    return result;
  });
<<<<<<< HEAD
  const [status, setStatus] = useState<StatusWatchedType>(
    (season_watched?.serie.status as StatusWatchedType) ?? null,
  );
=======
  const [status, setStatus] = useState<StatusWatchedType>(null);
>>>>>>> c8f9662 (broken)

  useEffect(() => {
    if (status === "PLANNING") {
      setSeason(new Array<boolean>(number_of_seasons).fill(false));
    } else if (status === "COMPLETED") {
      setSeason(new Array<boolean>(number_of_seasons).fill(true));
    }
  }, [status, number_of_seasons]);

  async function submit() {
<<<<<<< HEAD
    if (status === "COMPLETED") {
      await markCompleted(userId, serieId, serie);
    } else if (status === "PLANNING") {
      await removeAllSerie(userId, serieId, serie);
    } else {
      await updateSerie(userId, serieId, serie, seasonWatched, status);
    }

    context?.close();
    router.refresh();
=======
    console.log("submit");
    await updateSerieData(userId, serieId, serie, seasonWatched, status);
>>>>>>> c8f9662 (broken)
  }

  return (
    <main className="z-20 mx-auto my-32 h-fit min-h-56 w-11/12 bg-foreground text-white xl:w-4/5 2xl:w-3/5">
      <section className="h-fit">
        <div className="flex h-16 w-full items-center justify-between text-black">
          <div className="mx-4">{name}</div>
          <div className="grid h-16 w-16">
            <button
              className="my-auto h-3/4 w-3/4 bg-secondary text-white"
              onClick={context?.close}
            >
<<<<<<< HEAD
              x
=======
              X
>>>>>>> c8f9662 (broken)
            </button>
          </div>
        </div>
        <hr className="mb-2 mt-1 h-2 w-full bg-primary" />
      </section>
      <section className="h-fit w-full md:flex">
        {/* IMG + VOTE */}
        <div className="h-fit w-full sm:w-1/6 md:flex">
          <div className="mx-4">
            <div className="mx-auto h-[150px] w-[100px] p-2 sm:h-[200px] sm:w-[150px]">
              <Image
                src={TMDB_IMAGE_URL(poster_path)}
                alt={name}
                width={150}
                height={150}
                className="h-full w-full"
              />
            </div>
            <button className="hidden w-full bg-red-600 py-2 md:block">
              Remove
            </button>
          </div>

          <hr className="mb-2 mt-1 h-2 w-full bg-primary md:hidden" />
          <hr className="mb-2 mt-1 hidden h-full w-2 bg-primary md:block" />
        </div>

        {/* Right side on desktop */}
        <div className="mx-auto w-full text-black sm:w-5/6 md:mx-0">
          {/* Data */}
          <div className="space-y-4 md:mr-2">
            <div className="flex flex-col justify-between md:flex-row">
              <p className="w-full text-center md:w-1/5 md:text-start">
                Status:
              </p>
              <select
                className="w-full bg-primary py-2 text-center md:w-3/5"
                value={status as string}
                onChange={(e) => setStatus(e.target.value as StatusWatchedType)}
              >
                {StatusTypes.map((sta) => (
                  <option key={sta as string} value={sta as string}>
                    {sta}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col overflow-hidden md:flex-row">
              <p className="w-full text-center md:w-1/5 md:text-start">
                Season Watched:
              </p>
              <div className="flex w-full gap-2 overflow-x-scroll bg-primary md:w-4/5">
                {seasonWatched.map((watched, index) => {
                  const season = seasons[index];
                  if (season === undefined) return null;
                  const { id, season_number } = season;

                  return (
                    <div
                      key={id}
                      className={`m-1 my-4 grid min-h-12 min-w-12 cursor-pointer place-content-center rounded-sm ${watched ? "bg-secondary" : "bg-background"} text-white`}
                      onClick={() =>
                        setSeason((c) => {
                          const copy = [...c];
                          copy[index] = !copy[index];
                          return copy;
                        })
                      }
                    >
                      <span>{season_number}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col justify-between md:flex-row">
              <p className="w-full text-center md:w-1/5 md:text-start">
                Episode Watched:
              </p>
              <div className="flex w-full bg-primary text-center md:w-3/5">
                <div className="w-4/5 bg-inherit py-2 text-center">
                  {episodeWatched}
                </div>
                <p className="w-1/5 border-l-2 border-secondary py-2 text-center">
                  {number_of_episodes}
                </p>
              </div>
            </div>
          </div>

          <div className="sr-only">
            <code>{JSON.stringify(status, null, 2)}</code>
            <code>{JSON.stringify(seasonWatched, null, 2)}</code>
            <code>{JSON.stringify(episodeWatched, null, 2)}</code>
          </div>

          {/* Actions */}
          <div className="my-4 w-full space-y-2 px-4 text-white sm:mt-auto sm:space-y-0">
<<<<<<< HEAD
            <div className="mt-4 w-full">
=======
            <div className="w-full">
>>>>>>> c8f9662 (broken)
              <button onClick={submit} className="w-full bg-secondary py-2">
                Save
              </button>
            </div>
            <div className="w-full sm:hidden">
              <button className="w-full bg-secondary py-2">Close</button>
            </div>
            <div className="w-full sm:hidden">
              <button className="w-full bg-red-600 py-2 text-white">
                Remove
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="text-black"></div>
    </main>
  );
}
