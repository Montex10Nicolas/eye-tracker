"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { toast } from "sonner";
import { TMDB_IMAGE_URL, changeDateInvoValue } from "~/_utils/utils";
import {
  type DBSeasonWatchedType,
  type StatusWatchedType,
} from "~/server/db/types";
import { type Season, type Serie } from "~/types/tmdb_detail";
import { type addEpisodeToSeasonWatched } from "../../../actions";

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
  close: () => void;
}) {
  const { serie, season, userId, seasonWatch, addEpisode, close } = props;
  const { name, poster_path } = serie;
  const { season_number } = season;

  // started: Date | null = null,
  // ended: Date | null = null,
  // epWatched = 0;

  const [status, setStatus] = useState<StatusWatchedType>(() => {
    return (seasonWatch?.status as StatusWatchedType) ?? "PLANNING";
  });
  const [episodeWatched, setEpisode] = useState(() => {
    return seasonWatch?.episodeWatched ?? 0;
  });
  const [started, setStarted] = useState<Date | null>(() => {
    return seasonWatch?.started as Date | null;
  });
  const [ended, setEnded] = useState<Date | null>(() => {
    return seasonWatch?.ended as Date | null;
  });

  const completed = status === "COMPLETED";

  useEffect(() => {
    if (status === "COMPLETED") {
      setEpisode(season.episode_count);
      setEnded(new Date());
    } else if (status === "PLANNING") {
      setEpisode(0);
    }
  }, [status, setEpisode, season.episode_count]);

  useEffect(() => {
    if (episodeWatched === season.episode_count) {
      setStatus("COMPLETED");
      return;
    } else if (episodeWatched === 0) {
      setStatus("PLANNING");
      return;
    }

    setStatus("WATCHING");
  }, [episodeWatched, season.episode_count]);

  useEffect(() => {
    console.log("Edned", ended);
    if (ended === null || ended === undefined) return;
    setStatus("COMPLETED");
  }, [ended]);

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
    close();
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
    close();
  }

  const startedMax = ended ?? new Date();
  const endedMin = started;
  const endedMax = new Date();

  return (
    <section className="z-40 my-5 h-[80%] w-[90%] cursor-default bg-white p-4 text-black sm:h-[70%] sm:w-[70%]">
      <div className="flex h-full w-full flex-col items-center gap-4">
        <h1 className="mx-auto text-lg font-bold sm:text-3xl">
          {name} <span>{season_number}</span>
        </h1>
        {/* Poster */}
        <div className="h-[200px] w-24 overflow-hidden sm:h-[300px] sm:w-36">
          <Image
            src={TMDB_IMAGE_URL(poster_path)}
            alt={name}
            width={300}
            height={300}
            className="h-full w-full"
          />
        </div>

        {/* STATUS */}
        <div className="flex justify-center">
          <select
            className="w-36 rounded-sm bg-blue-500 px-1 py-4 text-center text-xl font-semibold text-white sm:py-2"
            onChange={(e) => setStatus(e.target.value as StatusWatchedType)}
            value={status as string}
          >
            {StatusTypes.map((value) => {
              let disabled = false;
              disabled =
                (value === "DROPPED" && completed) ||
                (value === "WATCHING" && completed);
              return (
                <option disabled={disabled} value={value as string} key={value}>
                  {value}
                </option>
              );
            })}
          </select>
        </div>

        {/* EPISODE */}
        <div className="flex flex-row items-center justify-around gap-8">
          <button
            disabled={episodeWatched === 0}
            onClick={() => setEpisode((c) => c - 1)}
            className="h-8 w-8 rounded-sm bg-slate-300 text-3xl disabled:opacity-40"
          >
            -
          </button>
          <select
            className="w-36 rounded-sm bg-blue-500 px-1 py-4 text-center text-xl font-semibold text-white sm:py-2"
            value={episodeWatched}
            onChange={(e) => setEpisode(parseInt(e.target.value))}
          >
            {new Array(season.episode_count + 1)
              .fill(null)
              .map((value, index) => {
                return (
                  <option key={index} value={index}>
                    {index}
                  </option>
                );
              })}
          </select>
          <button
            disabled={completed}
            onClick={() => setEpisode((c) => c + 1)}
            className="h-8 w-8 rounded-sm bg-slate-300 p-0 text-3xl disabled:opacity-40"
          >
            <span>+</span>
          </button>
        </div>

        {/* Started */}
        <div className="flex w-full justify-between gap-4">
          {/* Started */}
          <div className="w-[90%]">
            <label htmlFor="started">Started</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                max={changeDateInvoValue(startedMax)}
                type="date"
                className="h-12 w-full rounded-sm bg-blue-500 px-4 text-center font-bold uppercase text-white"
                name="started"
                value={changeDateInvoValue(started)}
                onChange={(e) => {
                  setStarted(() => {
                    const value = e.target.value;
                    return value.length === 0 ? null : new Date(value);
                  });
                }}
              />
              <button
                onClick={() => setStarted(new Date())}
                className="h-12 rounded-sm bg-green-500 px-4 text-sm uppercase text-white"
              >
                Today
              </button>
            </div>
          </div>

          {/* Ended */}
          <div className="w-[90%]">
            <label htmlFor="ended" className="mx-auto">
              Ended
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="date"
                name="ended"
                min={changeDateInvoValue(endedMin)}
                max={changeDateInvoValue(endedMax)}
                className="h-12 w-full rounded-sm bg-blue-500 px-4 text-end font-bold uppercase text-white"
                value={changeDateInvoValue(ended)}
                onChange={(e) => {
                  setEnded(() => {
                    const value = e.target.value;
                    return value.length === 0 ? null : new Date(value);
                  });
                }}
              />
              <button
                onClick={() => setEnded(new Date())}
                className="h-12 rounded-sm bg-green-500 px-4 text-sm uppercase text-white"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mx-auto mt-auto flex w-[90%] gap-5 sm:w-[80%]">
          <button
            onClick={close}
            className="w-full bg-green-900 font-bold uppercase text-white"
          >
            Close
          </button>
          <button
            onClick={remove}
            className="w-full bg-red-500 font-bold uppercase text-white"
          >
            Remove Season
          </button>
          <button
            onClick={submit}
            className="w-full bg-blue-500 font-bold uppercase text-white sm:h-12"
          >
            Save
          </button>
        </div>

        <div className="sr-only">
          <p>{status}</p>
          <p>Started: {started?.toLocaleDateString()}</p>
          <p>Ended: {ended?.toLocaleDateString()}</p>
          <p>EP: {episodeWatched}</p>
        </div>
      </div>
    </section>
  );
}
