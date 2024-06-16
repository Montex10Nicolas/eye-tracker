"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { toast } from "sonner";
import { TMDB_IMAGE_URL, dateIntoDateInput } from "~/_utils/utils";
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
  const { season_number, name: serie_name, episode_count } = season;

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

  return (
    <section className="z-20 w-11/12 bg-foreground text-black">
      <div>
        <div className="text-center">
          <p className="">{name}</p>
          <p className="">{serie_name}</p>
        </div>

        <hr className="my-1 h-1 w-full bg-primary" />

        <div className="flex items-center gap-2">
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
          <div className="mr-2">
            <div>
              <input
                className="bg-primary py-1 text-center"
                type="number"
                value={8}
              />
            </div>
          </div>
        </div>

        <hr className="my-1 h-1 w-full bg-primary" />

        <div>
          {/* Episode count */}
          <div>
            <h3 className="text-center">Episodes</h3>
            <div className="flex">
              <button className="w-1/12">-</button>
              <input
                className="w-10/12 bg-primary py-2 text-center"
                type="number"
                value={0}
              />
              <button className="w-1/12">+</button>
            </div>
          </div>

          {/* Progress/Status */}
          <div>
            <h3 className="text-center">Status</h3>
            <div className="w-full px-4">
              <select className="w-full bg-primary py-2 text-center lowercase">
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
        </div>
      </div>
    </section>
  );
}
