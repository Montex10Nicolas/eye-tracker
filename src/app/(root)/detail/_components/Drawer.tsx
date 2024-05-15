"use client";

import Image from "next/image";
import { useState } from "react";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { type Season, type TVDetail } from "~/types/tmdb_detail";
import { type SeasonWatchWithEpisodes } from "../actions";
import { type ActionAddAll } from "./Buttons";

export default function SeasonDrawer(props: {
  season: Season;
  userId: string;
  serie: TVDetail;
  addAllSeason: ActionAddAll;
  seasonWatched: SeasonWatchWithEpisodes | undefined;
}) {
  const { season, addAllSeason, userId, serie, seasonWatched } = props;
  const [isSelected, setIsSelected] = useState(false);
  const [selected, setSelected] = useState(() => {
    if (seasonWatched === undefined) {
      return new Array(season.episode_count).fill(false) as boolean[];
    }

    const array = new Array(season.episode_count).fill(false) as boolean[];
    const episodes = seasonWatched.episode;
    for (const episode of episodes) {
      console.log(
        "You have watched",
        episode.episode.episodeDate.episode_number,
      );
      const number = episode.episode.episodeDate.episode_number - 1;
      array[number] = true;
    }

    return array;
  });

  const episodeNumbers: number[] = [];
  for (let index = 0; index < selected.length; index++) {
    if (selected[index]) episodeNumbers.push(index);
  }

  async function add() {
    await addAllSeason(season, userId, serie, episodeNumbers);
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="w-full rounded-md bg-sky-700 px-4 py-2 font-semibold uppercase text-white">
          edit
        </button>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-slate-900">
        <div className="mx-auto w-[70%]">
          <code>{JSON.stringify(selected, null, 2)}</code>
          <DrawerHeader>
            <DrawerTitle>Select the season you have watched</DrawerTitle>
          </DrawerHeader>
          <div>
            <div className="flex flex-col items-center justify-center gap-2">
              <div>
                <span className="text-xl font-semibold">{season.name} </span>
              </div>
              <div className="flex flex-row gap-2">
                <label htmlFor="all" className="w-20">
                  <span className="">{isSelected ? "remove" : "add"} </span>
                  all episodes
                </label>
                <input
                  className="cursor-pointer"
                  type="checkbox"
                  name="all"
                  onChange={(input) => {
                    const value = input.target.checked;
                    setSelected((t) => {
                      if (t.length < 0) return t;
                      return new Array(t.length).fill(value) as boolean[];
                    });
                    setIsSelected((c) => !c);
                  }}
                />
              </div>
            </div>
            <ScrollArea className="h-60">
              <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 md:grid-cols-5">
                {selected.map((_, index) => {
                  return (
                    <div
                      key={`index-${season.id}-${index}`}
                      className={`border-3 h-full w-32 cursor-pointer rounded-md border-sky-600 p-2 ${selected[index] === true ? "border" : ""}`}
                      onClick={() => {
                        setSelected((c) => {
                          const copy = [...c];
                          copy[index] = !copy[index];
                          return copy;
                        });
                      }}
                    >
                      <Image
                        src={TMDB_IMAGE_URL(season.poster_path)}
                        alt={season.id + season.name}
                        width={150}
                        height={150}
                      />
                      <div>Episode: {index + 1}</div>
                    </div>
                  );
                })}
              </div>
              <ScrollBar className="mt-4" orientation="horizontal" />
            </ScrollArea>
          </div>
          <DrawerFooter>
            <button
              onClick={add}
              className="rounded-sm bg-green-600 px-4 py-2 font-semibold uppercase disabled:bg-slate-600"
              disabled={episodeNumbers.length === 0}
            >
              Submit
            </button>
            <button
              onClick={() =>
                setSelected((t) => {
                  return new Array(t.length).fill(false) as boolean[];
                })
              }
              className="rounded-sm bg-orange-600 px-4 py-2 font-semibold uppercase disabled:bg-slate-600"
              disabled={episodeNumbers.length === 0}
            >
              reset
            </button>
            <DrawerClose asChild>
              <button className="rounded-sm bg-red-700 px-4 py-2 font-semibold uppercase">
                Cancel
              </button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
