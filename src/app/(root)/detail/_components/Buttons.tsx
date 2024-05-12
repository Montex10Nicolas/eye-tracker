"use client";

import { type Season } from "~/types/tmdb_detail";

export function SeasonButtons(props: {
  addAllSeason: (
    season: Season,
    userId: string,
    serieId: string,
  ) => Promise<void>;
  season: Season;
  userId: string;
  serieId: string;
}) {
  const { addAllSeason: addSeason, season, userId, serieId } = props;
  async function addCompleted() {
    await addSeason(season, userId, serieId);
  }
  function less() {
    console.log("b");
  }

  return (
    <>
      <button
        onClick={addCompleted}
        className="h-full w-full rounded-sm bg-green-600 font-semibold uppercase text-white"
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
