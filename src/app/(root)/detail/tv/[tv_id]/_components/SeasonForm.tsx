"use client";

import { useContext, useEffect, useMemo, useState } from "react";

import Image from "next/image";
import { toast } from "sonner";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { Calendar } from "~/components/ui/calendar";
import {
  type DBSeasonWatchedType,
  type StatusWatchedType,
} from "~/server/db/types";
import { type Season, type Serie } from "~/types/tmdb_detail";
import { type addEpisodeToSeasonWatched } from "../../../actions";
import { CloseContext } from "./EditSeason";

const StatusTypes: StatusWatchedType[] = [
  "PLANNING",
  "WATCHING",
  "COMPLETED",
  "DROPPED",
  "PAUSED",
] as const;

export function SeasonForm(props: {
  serie: Serie;
  season: Season;
  userId: string;
  seasonWatch: DBSeasonWatchedType | undefined;
  addEpisode: typeof addEpisodeToSeasonWatched;
}) {
  const { serie, season, userId, seasonWatch, addEpisode } = props;
  const { name, poster_path } = serie;
  const { season_number, name: serie_name, episode_count } = season;

  const context = useContext(CloseContext);

  const [status, setStatus] = useState<StatusWatchedType>(() => {
    return (seasonWatch?.status as StatusWatchedType) ?? "PLANNING";
  });
  const [episodeWatched, setEpisode] = useState(() => {
    return seasonWatch?.episodeWatched ?? 0;
  });
  const [vote, setVote] = useState<number | null>(null);
  const [started, setStarted] = useState<Date | undefined>(() => {
    return seasonWatch?.started as Date | undefined;
  });
  const [ended, setEnded] = useState<Date | undefined>(() => {
    return seasonWatch?.ended as Date | undefined;
  });

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (episodeWatched < 0) {
      setEpisode(0);
    } else if (episodeWatched >= episode_count) {
      setEpisode(episode_count);
      setStatus("COMPLETED");
      setEnded(today);
    }
  }, [episodeWatched, episode_count, today]);

  useEffect(() => {
    if (status === "COMPLETED") {
      setEpisode(episode_count);
    } else if (status === "PLANNING") {
      setEpisode(0);
    }
  }, [status, episode_count]);

  useEffect(() => {
    if (ended === undefined) return;
    setStatus("COMPLETED");
    setEpisode(episode_count);
  }, [ended, episode_count]);

  const completed = status === "COMPLETED";

  const endMax = today;
  const startMax = ended ?? today;
  const endMin = started;

  async function submit() {
    toast("Updating", {
      description: "Please wait a moment...",
      duration: 1300,
    });
    await addEpisode(userId, serie, season, {
      episodeCount: episodeWatched,
      status: status,
      started: started,
      ended: ended,
    });
    context?.close();
  }

  async function remove() {
    toast("Removing", {
      description: "Please wait a moment...",
      duration: 1300,
    });
    await addEpisode(userId, serie, season, {
      episodeCount: -1,
      status: null,
      started: null,
      ended: null,
    });
    context?.close();
  }

  return (
    <section className="z-20 mx-auto my-32 h-fit w-11/12 bg-foreground text-black xl:w-4/5 2xl:w-3/5">
      <div className="">
        <div className="flex justify-between text-center">
          <div className="w-full">
            <p className="">{name}</p>
            <p className="">{serie_name}</p>
            <code>{JSON.stringify(context, null, 2)}</code>
          </div>
          <div
            onClick={context?.close}
            className="mx-1 my-1 h-12 w-12 cursor-pointer bg-secondary text-center font-bold text-white"
          >
            x
          </div>
        </div>

        <hr className="my-1 h-1 w-full bg-primary" />

        <div className="md:flex">
          <div className="m-1 flex flex-row items-center gap-2 sm:flex-col md:relative">
            {/* IMG + INFO */}
            <div className="relative h-[150px] w-[110px]">
              <Image
                src={TMDB_IMAGE_URL(poster_path)}
                alt={`${name}-${season_number}`}
                width={100}
                height={150}
                className="h-full w-full"
              />
              <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-b from-transparent to-black">
                <div className="absolute bottom-1 flex w-full justify-between px-2 text-white">
                  <span>S{season_number}</span>
                  <span>{episode_count}</span>
                </div>
              </div>
            </div>

            {/* Vote */}
            <div className="mr-2 flex h-full flex-col space-y-4">
              <div className="h-full">
                <input
                  className="bg-primary py-1 text-center"
                  type="number"
                  value={8}
                />
              </div>
              <button
                onClick={remove}
                className="mt-auto hidden w-full bg-red-600 px-2  py-2 text-white sm:block"
              >
                Delete
              </button>
            </div>
            <hr className="right-0 top-0 hidden h-full w-1 bg-primary sm:block md:absolute" />
          </div>
          <hr className="my-1 h-1 w-full bg-primary md:hidden" />
          <div className="mx-auto w-full">
            <div className="grid-cols-2 gap-y-2 md:grid">
              {/* Episode count */}
              <div className="max-h-fit">
                <h3 className="text-center">Episodes</h3>
                <div className="flex">
                  <button
                    className="w-2/12"
                    onClick={() => setEpisode((c) => c - 1)}
                  >
                    <span className="text-3xl">-</span>
                  </button>
                  <div className="flex w-8/12 bg-primary text-center">
                    <input
                      className="h-full w-10/12 bg-inherit py-2 text-center"
                      type="number"
                      value={episodeWatched}
                      onChange={(e) => setEpisode(parseInt(e.target.value))}
                    />
                    <div className="grid w-2/12 place-content-center border-l-2 border-secondary">
                      <span>Tot: {episode_count}</span>
                    </div>
                  </div>
                  <button
                    className="w-2/12 text-lg"
                    onClick={() => setEpisode((c) => c + 1)}
                  >
                    <span className="text-3xl">+</span>
                  </button>
                </div>
              </div>

              {/* Progress/Status */}
              <div className="max-h-fit">
                <h3 className="text-center">Status</h3>
                <div className="w-full px-4">
                  <select
                    value={status as string}
                    onChange={(e) =>
                      setStatus(e.target.value as StatusWatchedType)
                    }
                    className="w-full bg-primary py-2 text-center lowercase"
                  >
                    {StatusTypes.map((status) => (
                      <option
                        key={status}
                        className="lowercase"
                        value={status as string}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Started */}
              <div className="row-span-4 mx-auto flex min-h-[400px] w-4/5 flex-col items-center">
                <h3 className="text-center">Started</h3>
                <div className="mx-auto min-h-8 w-4/5 text-center">
                  {started?.toLocaleDateString()}
                </div>
                <Calendar
                  toDate={startMax}
                  selected={started}
                  onSelect={setStarted}
                  mode="single"
                />
              </div>
              {/* Ended */}
              <div className="mx-auto flex min-h-[400px] w-4/5 flex-col items-center">
                <h3 className="text-center">Ended</h3>
                <div className="mx-auto min-h-8 w-4/5 text-center">
                  {ended?.toLocaleDateString()}
                </div>
                <Calendar
                  fromDate={endMin}
                  toDate={endMax}
                  selected={ended}
                  onSelect={setEnded}
                  mode="single"
                />
              </div>
            </div>
            <div className="mx-auto mb-2 flex w-4/5 flex-col gap-2 text-white sm:flex-row">
              <button onClick={submit} className="w-full bg-secondary py-2">
                Save
              </button>
              <button
                onClick={context?.close}
                className="bg-secondary py-2 sm:hidden"
              >
                Close
              </button>
              <button onClick={remove} className="bg-red-600 py-2 sm:hidden ">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
