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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type TVDetail } from "~/types/tmdb_detail";
import { addSeason } from "../actions";

// Display a drawer with all episodes etc
export function SeasonDrawer(props: {
  tv: TVDetail;
  addSeason: (serieId: string, seasonNumber: number[]) => void;
}) {
  const { tv } = props;
  const { seasons } = tv;

  const [selected, setSelected] = useState(
    new Array<boolean>(tv.seasons.length).fill(false),
  );

  async function add() {
    const tvId = tv.id.toString();
    const arr: number[] = [];
    let index = 0;
    for (const i of selected) {
      i ? arr.push(index++) : index++;
    }
    await addSeason(tvId, arr);
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="mt-2 w-full rounded-md bg-sky-700 px-4 py-2 font-semibold uppercase text-white">
          seasons
        </button>
      </DrawerTrigger>
      <DrawerContent className="w-full bg-slate-900">
        <div className="mx-auto w-[70%]">
          <DrawerHeader>
            <DrawerTitle>Select the season you have watched</DrawerTitle>
          </DrawerHeader>
          <div>
            <div className="flex flex-row items-center justify-center gap-2">
              <label htmlFor="all">Select all season</label>
              <input
                type="checkbox"
                name="all"
                onChange={(input) => {
                  const value = input.target.checked;
                  setSelected((t) => {
                    if (t.length < 0) return t;
                    return value
                      ? (new Array(t.length).fill(true) as boolean[])
                      : (new Array(t.length).fill(false) as boolean[]);
                  });
                }}
              />
            </div>
            <ScrollArea className="h-60">
              <div className="flex gap-2">
                {seasons.map((season) => {
                  return (
                    <div
                      key={season.id}
                      className={`border-3 h-full w-32 cursor-pointer rounded-md border-sky-600 p-2 ${selected[season.season_number] === true ? "border" : ""}`}
                      onClick={() => {
                        setSelected((c) => {
                          const index = season.season_number;
                          const copy = [...c];
                          copy[index] = !copy[index];
                          return copy;
                        });
                      }}
                    >
                      <p>{season.season_number}</p>
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
              onClick={add}
              className="rounded-sm bg-green-600 px-4 py-2 font-semibold uppercase"
            >
              Submit
            </button>
            <button
              onClick={() =>
                setSelected((t) => {
                  if (t.length < 0) return t;
                  return new Array(t.length).fill(false) as boolean[];
                })
              }
              className="rounded-sm bg-orange-600 px-4 py-2 font-semibold uppercase"
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
export function Bho() {
  return (
    <section className="mt-4 overflow-hidden rounded-md bg-white p-4 text-black">
      <h2 className="text-xl font-semibold">Credits</h2>
      <Tabs defaultValue="cast" className="relative mt-6">
        <TabsList className="flex w-full flex-row bg-black">
          <TabsTrigger value="cast" className="w-full">
            Cast
          </TabsTrigger>
          <TabsTrigger value="crew" className="w-full">
            Crew
          </TabsTrigger>
        </TabsList>
        <ScrollArea className="h-[500] w-full">
          <TabsContent value="cast" className="mt-6">
            <RenderCastCrew persons={tv.credits.cast} cast={true} />
          </TabsContent>
          <TabsContent value="crew" className="mt-6">
            <RenderCastCrew persons={tv.credits.crew} cast={false} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </section>
  );
}
