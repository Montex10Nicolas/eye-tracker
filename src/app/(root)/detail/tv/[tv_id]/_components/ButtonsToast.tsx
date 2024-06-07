"use client";

import { toast } from "sonner";
import { type Season, type Serie } from "~/types/tmdb_detail";
import { type SeriesAndSeasonsWatched } from "../../../actions";
import { EditSeason } from "./EditSeason";

export function SerieButton(props: {
  watched: SeriesAndSeasonsWatched | undefined;
  removeSerie: () => Promise<void>;
  addAllSerie: () => Promise<void>;
}) {
  const { watched, removeSerie, addAllSerie } = props;

  function addToast() {
    toast("Add Serie sooner", {
      description: "Serie is being added, please wait",
      duration: 1500,
    });
  }

  function removeToast() {
    toast("Remove Serie sooner", {
      description: "Serie is being removed, please wait",
      duration: 1500,
    });
  }

  return (
    <div className="grid h-12 w-full place-items-center  bg-slate-800">
      {watched?.serie.status === "COMPLETED" ? (
        <form className="h-full w-full" action={removeSerie}>
          <button
            type="submit"
            className="h-full w-full items-center justify-center bg-red-500 font-semibold uppercase"
            onClick={removeToast}
          >
            remove
          </button>
        </form>
      ) : (
        <form className="h-full w-full" action={addAllSerie}>
          <button
            type="submit"
            className="h-full w-full items-center justify-center bg-blue-500 font-semibold uppercase"
            onClick={addToast}
          >
            add
          </button>
        </form>
      )}
    </div>
  );
}

export function SeasonButton(props: {
  userId: string;
  serie: Serie;
  season: Season;
  DBAddSeason: () => Promise<void>;
  DBRemoveSeason: () => Promise<void>;
  EditBtn: JSX.Element
}) {
  const { userId, serie, season, DBAddSeason, DBRemoveSeason } = props;

  const AddBtn = (
    <form className="h-full w-full" action={DBAddSeason}>
      <button
        type="submit"
        className="h-full w-full items-center justify-center bg-blue-500 font-semibold uppercase text-white"
      >
        Add
      </button>
    </form>
  );

  const EditBtn = (
    <div className="h-full w-full">
      <EditSeason
        serie={serie}
        season={season}
        userId={userId}
        addEpisode={addEpisodeToSeasonWatched}
        season_w={found}
        myButton={
          <button className="h-full w-full cursor-pointer items-center justify-center bg-green-500 font-semibold uppercase text-white">
            edit
          </button>
        }
      />
    </div>
  );

  if (found === undefined) {
    return (
      <div className="flex h-12">
        {AddBtn}
        {EditBtn}
      </div>
    );
  }
  const { status } = found;
  const myStatus = status as StatusWatchedType;

  let customBtn: JSX.Element | null = null;

  const RemoveBtn = (
    <form action={DBRemoveSeason} className="h-full w-full">
      <button
        type="submit"
        className="h-full w-full items-center justify-center bg-red-500 font-semibold uppercase text-white"
      >
        Remove
      </button>
    </form>
  );

  if (myStatus === "COMPLETED") {
    customBtn = (
      <>
        {EditBtn}
        {RemoveBtn}
      </>
    );
  } else if (myStatus === "WATCHING") {
    customBtn = (
      <>
        {AddBtn}
        {EditBtn}
        {RemoveBtn}
      </>
    );
  } else {
    customBtn = (
      <>
        {AddBtn}
        {EditBtn}
      </>
    );
  }

  return <div className="flex h-12">{customBtn}</div>;
}
