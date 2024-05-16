"use client";

import { type Season, type Serie } from "~/types/tmdb_detail";
import { type SeasonWatchWithEpisodes } from "../actions";
import SeasonDrawer from "./Drawer";

export type ActionAddAll = (
  season: Season,
  userId: string,
  serie: Serie,
  episodesId: boolean[],
) => Promise<void>;

export function SeasonButtons(props: {
  addAllSeason: ActionAddAll;
  season: Season;
  userId: string;
  serie: Serie;
  seasonWatched: SeasonWatchWithEpisodes | undefined;
}) {
  const { addAllSeason, season, userId, serie, seasonWatched } = props;
  async function addAll() {
    const all = new Array(season.episode_count).fill(true) as boolean[];
    await addAllSeason(season, userId, serie, all);
  }

  async function removeAll() {
    const all = new Array(season.episode_count).fill(false) as boolean[];
    await addAllSeason(season, userId, serie, all);
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
        <button
          onClick={removeAll}
          className="h-full w-full rounded-sm bg-red-600 font-semibold uppercase"
        >
          remove
        </button>
      ) : null}

      <SeasonDrawer
        addAllSeason={addAllSeason}
        season={season}
        serie={serie}
        userId={userId}
        seasonWatched={seasonWatched}
      />
    </>
  );
}
