"use client";
import Image from "next/image";
import { useState } from "react";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { type TVDetail } from "~/types/tmdb_detail";
import { addSeason } from "../actions";

export function AppDrawer(props: {
  tv: TVDetail;
  addSeason: (serieId: string, seasonNumber: number) => void;
}) {
  const { tv } = props;
  const { seasons } = tv;

  const [selected, setSelected] = useState<number[]>([]);

  async function handleSubmit() {
    // console.log("handle", selected);
    // for (const seasonId of selected) {
    //   tv.seasons.findIndex((c) => c.id === seasonId);
    //   await addSeason(seasonId, seasonId);
    // }
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="mt-2 w-full rounded-md bg-sky-700 px-4 py-2 font-semibold uppercase text-white">
          add
        </button>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-slate-900">
        <div className="mx-auto w-[70%]">
          <DrawerHeader>
            <DrawerTitle>Select the season you have watched</DrawerTitle>
            {/* <DrawerDescription>Set your daily activity goal.</DrawerDescription> */}
          </DrawerHeader>
          <div>
            {/* <code>{JSON.stringify(selected, null, 2)}</code> */}
            <div className="">
              <label htmlFor="all">Select all season</label>
              <input
                onChange={(c) => {
                  if (c.target.checked) {
                    setSelected(() => {
                      const arr: number[] = [];
                      for (const i of seasons) arr.push(i.id);
                      return arr;
                    });
                  } else {
                    setSelected([]);
                  }
                }}
                type="checkbox"
                name="all"
              />
            </div>
            <ScrollArea className="h-60">
              <div className="flex gap-2">
                {seasons.map((season) => {
                  const index = selected.findIndex((c) => c === season.id);
                  return (
                    <div
                      key={season.id}
                      className={`border-3 h-full w-32 cursor-pointer rounded-md border-sky-600 p-2 ${index != -1 ? "border" : ""}`}
                      onClick={() => {
                        setSelected((c) => {
                          return index === -1
                            ? [...c, season.id]
                            : [
                                ...c.slice(0, index),
                                ...c.slice(index + 1, c.length),
                              ];
                        });
                      }}
                    >
                      <Image
                        src={TMDB_IMAGE_URL(season.poster_path)}
                        alt={season.id + season.name}
                        width={150}
                        height={150}
                      />
                      <div className="min-w-fit">{season.name}</div>
                    </div>
                  );
                })}
              </div>
              <ScrollBar className="mt-4" orientation="horizontal" />
            </ScrollArea>
          </div>
          <DrawerFooter>
            <button
              onClick={handleSubmit}
              className="rounded-sm bg-green-600 px-4 py-2 font-semibold uppercase"
            >
              Submit
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
