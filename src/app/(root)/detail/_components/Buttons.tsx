"use client";

import { revalidatePath, revalidateTag } from "next/cache";
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
  const {
    addAllSeason: addSeason,
    season,
    userId,
    serie,
    seasonWatched,
  } = props;
  async function addAllEpisodes() {
    await addSeason(season, userId, serie, []);
  }

  async function less() {
    console.log("less");
  }

  return (
    <>
      <button
        onClick={addAllEpisodes}
        className="disabled: h-full w-full rounded-sm bg-green-600 font-semibold uppercase text-white disabled:bg-gray-700"
        disabled={seasonWatched?.status === "completed"}
      >
        add
      </button>
      <button
        onClick={less}
        className="h-full w-full rounded-sm bg-sky-600 font-semibold uppercase text-white"
      >
        edit
      </button>
    </>
  );
}
