"use client";

import { type SeasonWatchedType } from "~/server/db/types";
import { type Season, type TVDetail } from "~/types/tmdb_detail";

type ActionAddAll = (
  season: Season,
  userId: string,
  serie: TVDetail,
  episodesId: string[],
) => Promise<void>;

export function SeasonButtons(props: {
  addAllSeason: ActionAddAll;
  season: Season;
  userId: string;
  serie: TVDetail;
  seasonWatched: SeasonWatchedType | undefined;
}) {
  const { addAllSeason, season, userId, serie, seasonWatched } = props;
  async function addAll() {
    await addAllSeason(season, userId, serie, []);
  }

  async function less() {
    console.log("less");
  }

  return (
    <>
      <button
        onClick={addAll}
        className="disabled: h-full w-full rounded-sm bg-green-600 font-semibold uppercase text-white disabled:bg-gray-700"
        disabled={seasonWatched?.status === "completed"}
      >
        add
      </button>
      {seasonWatched?.status === "completed" ? (
        <button className="h-full w-full rounded-sm bg-red-600 font-semibold uppercase">
          remove
        </button>
      ) : null}

      <button
        onClick={less}
        className="h-full w-full rounded-sm bg-sky-600 font-semibold uppercase text-white"
      >
        edit
      </button>
    </>
  );
}
