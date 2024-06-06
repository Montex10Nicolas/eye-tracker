"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { type DBSeasonWatchedType } from "~/server/db/types";
import { type Season, type Serie } from "~/types/tmdb_detail";
import { type addEpisodeToSeasonWatched } from "../../../actions";
import { SeasonForm } from "./SeasonForm";

export function EditSeason(props: {
  serie: Serie;
  season: Season;
  userId: string;
  addEpisode: typeof addEpisodeToSeasonWatched;
  season_w: DBSeasonWatchedType | undefined;
  myButton: JSX.Element;
}) {
  const [visible, setVisible] = useState(false);
  const { serie, season, addEpisode, userId, season_w, myButton } = props;

  if (!visible) {
    return (
      <>
        <div
          className="h-full w-full appearance-none"
          onClick={() => setVisible(true)}
        >
          {/* <EditIcon /> */}
          {myButton}
        </div>
      </>
    );
  }

  function closeDialog() {
    setVisible(false);
    document.body.style.overflowY = "visible";
  }

  return (
    <div className="">
      {createPortal(
        <div className="fixed left-0 top-0 flex h-screen w-screen items-center justify-center overflow-hidden bg-slate-900 bg-opacity-95">
          <div
            onClick={() => {
              setVisible(false);
            }}
            className="absolute left-0 top-0 min-h-full min-w-full cursor-crosshair bg-transparent"
          ></div>
          <SeasonForm
            userId={userId}
            serie={serie}
            season={season}
            addEpisode={addEpisode}
            seasonWatch={season_w}
            close={closeDialog}
          />
        </div>,
        document.body,
      )}
    </div>
  );
}
