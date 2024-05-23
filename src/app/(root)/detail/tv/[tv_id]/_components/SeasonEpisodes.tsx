"use client";

import { PopoverContent } from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { TMDB_IMAGE_URL } from "~/_utils/utils";
import { Calendar } from "~/components/ui/calendar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Popover, PopoverTrigger } from "~/components/ui/popover";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { type episodeTable, type seasonTable } from "~/server/db/schema";
import { type Season, type SeasonDetail } from "~/types/tmdb_detail";
import { EditIcon } from "../../../_components/Icons";

type Return = typeof episodeTable.$inferSelect;

function DatePicker(props: {
  index: number;
  setDates: (index: number, date: Date | undefined) => void;
}) {
  const [date, setDate] = useState<Date>();
  const { index, setDates } = props;

  function handleSelected(date: Date | undefined) {
    setDates(index, date);
    setDate(date);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={"w-[280px] justify-center text-left font-normal"}>
          <CalendarIcon className="mx-auto h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="z-10 w-auto bg-slate-950 p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelected}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default function DrawerEpisodes(props: {
  serverEpisodeQuery: (
    serieId: string,
    seasonId: string,
    season: Season,
    serieName: string,
  ) => Promise<Return[]>;
  seasonId: string;
  serieId: string;
  season: Season;
  serieName: string;
}) {
  const { serverEpisodeQuery, serieId, seasonId, season, serieName } = props;

  const ep_count = season.episode_count;

  const [episodes, setEpisodes] = useState<Return[]>([]);
  const [dates, setDates] = useState<Array<Date | undefined>>(
    new Array(ep_count).fill(undefined),
  );
  const [selected, setSelected] = useState<boolean[]>(
    new Array(ep_count).fill(false),
  );

  useEffect(() => {
    const a: boolean[] = [];
    for (const date of dates) {
      a.push(date !== undefined);
    }
    setSelected(a);
  }, [dates]);

  function handleCheckbox(e: ChangeEvent<HTMLInputElement>, index: number) {
    const value = e.target.checked;
    const date = value ? new Date() : undefined;
    setDate(index, date);
  }

  function setDate(index: number, date: Date | undefined) {
    setDates((c) => {
      const copy = [...c];
      copy[index] = date;
      return copy;
    });
  }

  async function getEpisodeFromSeason() {
    const episodes = await serverEpisodeQuery(
      serieId,
      seasonId,
      season,
      serieName,
    );
    setEpisodes(episodes);
  }

  return (
    <>
      <button
        onClick={getEpisodeFromSeason}
        className="flex h-full w-full cursor-pointer items-center justify-center bg-green-600"
      >
        <Drawer>
          <DrawerTrigger>
            <EditIcon />
          </DrawerTrigger>
          <DrawerContent className="bg-slate-800">
            <DrawerHeader>
              <h1 className="space-x-6 text-xl font-bold">
                <span>{serieName}</span> <span>|</span>
                <span>Season: {season.season_number}</span>
                <div>
                  <code>{JSON.stringify(dates, null, 2)}</code>
                </div>
                <div>
                  <code>{JSON.stringify(selected, null, 2)}</code>
                </div>
              </h1>
            </DrawerHeader>
            <ScrollArea className="h-80">
              <div className="mx-4 flex flex-row gap-4">
                {episodes.map((episode, index) => {
                  const data = episode.episodeDate;

                  return (
                    <div key={episode.id} className="relative">
                      <div className="h-10 w-full bg-black py-2 text-center text-white">
                        {data.name}
                      </div>
                      <div className="absolute right-4 top-12 h-8 w-8 overflow-hidden rounded-md">
                        <input
                          className="h-full w-full cursor-pointer"
                          type="checkbox"
                          onChange={(e) => handleCheckbox(e, index)}
                        />
                      </div>
                      <img
                        className="min-w-80 shrink-0"
                        src={TMDB_IMAGE_URL(data.still_path)}
                        alt=""
                      />
                      <div className="flex h-12 items-center justify-center rounded-b-md bg-black">
                        <div className="w-full text-center text-2xl">
                          {dates[index]?.toLocaleDateString()}
                        </div>
                        <button className="ml-auto flex h-full w-20 items-center justify-center rounded-br-md bg-[#AA3EDF]">
                          <DatePicker index={index} setDates={setDate} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <DrawerFooter>
              <button className="w-full rounded-sm bg-green-800 py-2 text-xl font-semibold uppercase text-white">
                submit
              </button>
              <DrawerClose>
                <button className="w-full rounded-sm bg-red-800 py-2 text-xl font-semibold uppercase text-white">
                  Cancel
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </button>
    </>
  );
}
