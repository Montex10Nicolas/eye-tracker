"use client";

import { toast } from "sonner";
import { type StatusWatchedType } from "~/server/db/types";

export function SerieButton(props: {
  removeSerie: () => Promise<void>;
  addAllSerie: () => Promise<void>;
  status: StatusWatchedType;
}) {
  const { status, removeSerie, addAllSerie } = props;

  function addToast() {
    toast("Add Serie", {
      description: "Serie is being added, please wait a second",
      duration: 1500,
    });
  }

  function removeToast() {
    toast("Remove Serie", {
      description: "Serie is being removed, please wait",
      duration: 1500,
    });
  }

  return (
    <div className="grid h-8 w-full place-items-center bg-slate-800 sm:h-12">
      {status === "COMPLETED" ? (
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

export function AddBtn(props: { DBAddSeason: () => Promise<void> }) {
  const { DBAddSeason } = props;
  return (
    <form className="h-full w-full" action={DBAddSeason}>
      <button
        type="submit"
        className="h-full w-full items-center justify-center bg-blue-500 font-semibold uppercase text-white"
        onClick={() => {
          toast("Add", {
            description: "Adding season...",
          });
        }}
      >
        Add
      </button>
    </form>
  );
}

export function RemoveBtn(props: { DBRemoveSeason: () => Promise<void> }) {
  const { DBRemoveSeason } = props;
  return (
    <form action={DBRemoveSeason} className="h-full w-full">
      <button
        type="submit"
        className="h-full w-full items-center justify-center bg-red-500 font-semibold uppercase text-white"
        onClick={() => {
          toast("Remove", {
            description: "Removing season...",
          });
        }}
      >
        Remove
      </button>
    </form>
  );
}
