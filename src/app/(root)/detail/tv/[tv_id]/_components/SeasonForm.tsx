"use client";

import { useEffect, useState, type ChangeEvent } from "react";

import Image from "next/image";
import { TMDB_IMAGE_URL, changeDateInvoValue } from "~/_utils/utils";

import {
  type DBSeasonWatchedType,
  type StatusWatchedType,
} from "~/server/db/types";
import { type Season, type Serie } from "~/types/tmdb_detail";
import { type addEpisodeToSeasonWatched } from "../../../actions";

export function SeasonForm(props: {
  serie: Serie;
  season: Season;
  userId: string;
  seasonWatch: DBSeasonWatchedType | undefined;
  addEpisode: typeof addEpisodeToSeasonWatched;
  close: () => void;
}) {
  const { serie, season, addEpisode, userId, seasonWatch, close } = props;
  const episode_count = season.episode_count;
  const ep_arr = new Array(episode_count).fill(null);
  const today = new Date();

  // Data for the form
  const [status, setStatus] = useState<StatusWatchedType>("WATCHING");
  const [episodeCount, setEpisode] = useState(0);
  const [started, setStarted] = useState<Date | null>(null);
  const [ended, setEnded] = useState<Date | null>(null);

  function handleStatus(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value.toUpperCase() as StatusWatchedType;
    setStatus(value);
  }

  function handleEpisodes(event: ChangeEvent<HTMLSelectElement>) {
    const value = parseInt(event.target.value);
    setEpisode(value);
  }

  function handleStarted(event: ChangeEvent<HTMLDataElement>) {
    const value = event.target.value;
    // Handle clear
    if (value.length === 0) {
      setStarted(null);
      return;
    }

    const date = new Date(value);
    setStarted(date);
  }
  function handleEnded(event: ChangeEvent<HTMLDataElement>) {
    const value = event.target.value;
    // Handle clear
    if (value.length === 0) {
      setEnded(null);
      return;
    }

    const date = new Date(value);
    setEnded(date);
  }

  useEffect(() => {
    if (seasonWatch === undefined) return;
    setEpisode(seasonWatch.episodeWatched);
    setStatus(seasonWatch.status);

    const started = seasonWatch.started as Date | null;
    const ended = seasonWatch.ended as Date | null;

    setStarted(started);
    setEnded(ended);
  }, [seasonWatch]);

  useEffect(() => {
    if (status === "COMPLETED") {
      setEpisode(episode_count);
    } else if (status === "PLANNING") {
      setEpisode(0);
    }
  }, [status, episode_count]);

  useEffect(() => {
    if (episodeCount < episode_count) {
      setStatus("WATCHING");
    } else if (episodeCount === episode_count) {
      setStatus("COMPLETED");
    }
  }, [episodeCount, episode_count]);

  async function handleSubmit() {
    await addEpisode(userId, serie, season, {
      episodeCount: episodeCount,
      status: status,
      started: started,
      ended: ended,
    });
    close();
  }

  async function handleRemove() {
    await addEpisode(userId, serie, season, {
      episodeCount: -1,
      status: null,
      started: null,
      ended: null,
    });
    close();
  }

  document.body.style.overflowY = "hidden";

  return (
    <section className="left-0 top-0 z-40 h-[70%] w-[70%] cursor-default rounded-md bg-white text-black">
      {/* Serie info and image */}
      <div className="grid h-full w-full grid-cols-3">
        <div className="col-span-1 flex h-full w-full flex-col items-center justify-center">
          <div>
            <p>{serie.name}</p>
            <p>{season.name}</p>
            <Image
              src={TMDB_IMAGE_URL(season.poster_path)}
              height={300}
              width={300}
              alt={`Poster season ${season.name}`}
              className="mx-auto my-auto"
            />
          </div>
        </div>

        {/* Episode Count */}
        <div className="col-span-2 flex h-full w-full flex-col items-center justify-center gap-4">
          <div className="mt-auto flex w-full flex-col items-center justify-center gap-2">
            <label htmlFor="episodes">Episode watched: </label>
            <select
              name="episodes"
              value={episodeCount}
              className="w-[50%] cursor-pointer rounded-sm border border-gray-950 px-4 py-2 text-center"
              onChange={handleEpisodes}
            >
              <option value="0" disabled={true}>
                0
              </option>
              {ep_arr.map((_, index) => (
                <option
                  className="cursor-pointer"
                  value={index + 1}
                  key={index}
                >
                  {index + 1}
                </option>
              ))}
            </select>
            <p>Value: {episodeCount}</p>
          </div>

          {/* Status */}
          <div className="flex w-full flex-col items-center justify-center">
            <label htmlFor="status">Status: </label>
            <select
              name="status"
              id=""
              className="w-[50%] cursor-pointer rounded-md border border-gray-900 px-4 py-2 text-center"
              onChange={handleStatus}
              value={status?.toLowerCase()}
            >
              <option value="planning">Planning</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
            <p>Current: {status}</p>
          </div>

          {/* Date */}
          <div className="flex w-full flex-col gap-2 md:w-[70%]">
            <div className="flex flex-col">
              <label htmlFor="started">Start Date: </label>
              <div className="flex justify-between">
                <input
                  className="cursor-pointer rounded-sm border border-black px-4 py-2"
                  type="date"
                  name="started"
                  max={
                    ended
                      ? changeDateInvoValue(ended)
                      : changeDateInvoValue(today)
                  }
                  value={changeDateInvoValue(started)}
                  onChange={handleStarted}
                />
                <button
                  className="rounded-sm bg-sky-600 px-4 py-2 uppercase text-white"
                  onClick={() => setStarted(today)}
                >
                  Today
                </button>
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="started">End Date: </label>
              <div className="flex justify-between">
                <input
                  className="cursor-pointer rounded-sm border border-black px-4 py-2"
                  type="date"
                  name="ended"
                  min={changeDateInvoValue(started)}
                  max={changeDateInvoValue(today)}
                  value={changeDateInvoValue(ended)}
                  onChange={handleEnded}
                />
                <button
                  className="rounded-sm bg-sky-600 px-4 py-2 uppercase text-white"
                  onClick={() => setEnded(today)}
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mx-4 mt-auto w-full space-y-3 p-2">
            <button
              onClick={handleSubmit}
              className="h-10 w-full rounded-sm bg-sky-500 font-bold uppercase text-white"
            >
              Save
            </button>
            <button
              onClick={handleRemove}
              className="h-10 w-full rounded-sm bg-red-800 font-bold uppercase text-white"
            >
              Remove
            </button>
            <button
              onClick={close}
              className=" h-10 w-full rounded-sm bg-red-600 font-bold uppercase text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
