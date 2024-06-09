"use client";

import { AccordionTrigger } from "@radix-ui/react-accordion";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { SerieButton } from "~/app/(root)/detail/tv/[tv_id]/_components/ButtonsToast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "~/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type StatusWatchedType } from "~/server/db/types";
import { type Serie } from "~/types/tmdb_detail";
import {
  type SeriesAndSeasonWatched,
  type seasonWatchWithSeason,
} from "../../user_action";

function MyTable(props: {
  data: SeriesAndSeasonWatched[];
  status: StatusWatchedType;
  markSerie: (
    userId: string,
    serieId: string,
    serieData: Serie,
  ) => Promise<void>;
  removeSerie: (
    userId: string,
    serieId: string,
    serieData: Serie,
  ) => Promise<void>;
  userId: string;
}) {
  const { data, status: TableStatus, markSerie, removeSerie, userId } = props;
  const router = useRouter();

  function DisplayTable(props: { seasons: seasonWatchWithSeason[] }) {
    const { seasons } = props;

    function Row(props: { season: seasonWatchWithSeason }) {
      const {
        season: {
          season: {
            seasonName,
            season_data: { poster_path },
          },
          started,
          ended,
          status,
        },
      } = props;

      const startedString = started
        ? displayHumanDate(new Date(started).toLocaleDateString())
        : "Not set";
      const endedString = ended
        ? displayHumanDate(new Date(ended).toLocaleDateString())
        : "Not set";

      return (
        <TableRow className="">
          <TableCell>
            <div>
              <Image
                src={TMDB_IMAGE_URL(poster_path)}
                alt={seasonName}
                width={100}
                height={100}
              />
            </div>
            <div className="flex flex-col">
              <a className="font-semibold text-blue-600 underline">
                {seasonName}
              </a>
            </div>
          </TableCell>

          <TableCell>{status}</TableCell>
          <TableCell>{displayHumanDate(startedString)}</TableCell>
          <TableCell>{displayHumanDate(endedString)}</TableCell>
        </TableRow>
      );
    }

    return (
      <Table className="border border-white p-2 text-xs sm:text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Season</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stated</TableHead>
            <TableHead>Ended</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seasons.map((season) => (
            <Row key={season.id} season={season} />
          ))}
        </TableBody>
      </Table>
    );
  }

  function DisplayAccording(props: { serie: SeriesAndSeasonWatched }) {
    const {
      serie: {
        serie: {
          name,
          serie_data: { poster_path, id },
        },
        started,
        ended,
        status,
        seasonsWatched,
      },
    } = props;
    const { serie: watched } = props;
    const serieData = watched.serie.serie_data;
    const serieId = id.toString();

    const startedString = started
      ? displayHumanDate(new Date(started).toLocaleDateString())
      : "Not set";
    const endedString = ended
      ? displayHumanDate(new Date(ended).toLocaleDateString())
      : "Not set";

    async function addAll() {
      await markSerie(userId, serieId, serieData);
      router.refresh();
    }
    async function removeAll() {
      await removeSerie(userId, serieId, serieData);
      router.refresh();
    }

    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={name}>
          <AccordionTrigger className="w-full">
            <div className="flex w-full flex-row items-center justify-between gap-4 px-1 py-2 text-sm">
              <div className="">
                <Image
                  src={TMDB_IMAGE_URL(poster_path)}
                  height={150}
                  width={150}
                  alt={name}
                  className="h-[80px] w-[65px] sm:h-[150px] sm:w-[100px]"
                />
                <div>
                  <p className="text-lg font-bold">{name}</p>
                  <SerieButton
                    addAllSerie={addAll}
                    removeSerie={removeAll}
                    status={status as StatusWatchedType}
                  />
                </div>
              </div>
              <p>{status}</p>
              <p>{displayHumanDate(startedString)}</p>
              <p>{displayHumanDate(endedString)}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <DisplayTable seasons={seasonsWatched} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  if (data.length === 0) {
    return (
      <section>
        <h1>You don&apos;t have any data in {TableStatus}</h1>
      </section>
    );
  }

  return (
    <section>
      {data.map((serie) => (
        <DisplayAccording key={serie.id} serie={serie} />
      ))}
    </section>
  );
}

export function Tables(props: {
  watching: SeriesAndSeasonWatched[];
  completed: SeriesAndSeasonWatched[];
  planned: SeriesAndSeasonWatched[];
  dropped: SeriesAndSeasonWatched[];
  paused: SeriesAndSeasonWatched[];
  userId: string;
  markSerie: (
    userId: string,
    serieId: string,
    serieData: Serie,
  ) => Promise<void>;
  removeSerie: (
    userId: string,
    serieId: string,
    serieData: Serie,
  ) => Promise<void>;
}) {
  const {
    watching,
    completed,
    planned,
    dropped,
    paused,
    markSerie,
    removeSerie,
    userId,
  } = props;
  const [filter, setFilter] = useState<StatusWatchedType | null>(null);

  const WatchingTable = (
    <MyTable
      userId={userId}
      markSerie={markSerie}
      removeSerie={removeSerie}
      status={"WATCHING"}
      data={watching}
    />
  );
  const CompletedTable = (
    <MyTable
      userId={userId}
      markSerie={markSerie}
      removeSerie={removeSerie}
      status={"COMPLETED"}
      data={completed}
    />
  );
  const PlannedTable = (
    <MyTable
      userId={userId}
      markSerie={markSerie}
      removeSerie={removeSerie}
      status={"PLANNING"}
      data={planned}
    />
  );
  const DroppedTable = (
    <MyTable
      userId={userId}
      markSerie={markSerie}
      removeSerie={removeSerie}
      status={"DROPPED"}
      data={dropped}
    />
  );
  const PausedTable = (
    <MyTable
      userId={userId}
      markSerie={markSerie}
      removeSerie={removeSerie}
      status={"PAUSED"}
      data={paused}
    />
  );

  let FinalTable: JSX.Element = <></>;

  switch (filter) {
    case "COMPLETED":
      FinalTable = <>{CompletedTable}</>;
      break;
    case "DROPPED":
      FinalTable = <>{DroppedTable}</>;
      break;
    case "PAUSED":
      FinalTable = <>{PausedTable}</>;
      break;
    case "PLANNING":
      FinalTable = <>{PlannedTable}</>;
      break;
    case "WATCHING":
      FinalTable = <>{WatchingTable}</>;
      break;
    default:
      FinalTable = (
        <>
          {WatchingTable}
          {CompletedTable}
          {PlannedTable}
          {DroppedTable}
          {PausedTable}
        </>
      );
      break;
  }

  return (
    <main>
      {/* Filter button */}
      <section className="sticky top-0 z-10 flex w-full flex-row flex-wrap justify-around gap-y-2 bg-white pt-2 sm:justify-center sm:gap-8">
        <button
          className={`w-24 rounded-sm uppercase text-white ${filter === null ? "bg-red-300" : "bg-sky-600"}`}
          onClick={() => setFilter(null)}
        >
          All
        </button>
        <button
          className={`w-24 rounded-sm uppercase text-white ${filter === "WATCHING" ? "bg-red-300" : "bg-sky-600"}`}
          onClick={() => setFilter("WATCHING")}
        >
          Watching
        </button>
        <button
          className={`w-24 rounded-sm uppercase text-white ${filter === "COMPLETED" ? "bg-red-300" : "bg-sky-600"}`}
          onClick={() => setFilter("COMPLETED")}
        >
          Completed
        </button>
        <button
          className={`w-24 rounded-sm uppercase text-white ${filter === "PLANNING" ? "bg-red-300" : "bg-sky-600"}`}
          onClick={() => setFilter("PLANNING")}
        >
          Planned
        </button>
        <button
          className={`w-24 rounded-sm uppercase text-white ${filter === "PAUSED" ? "bg-red-300" : "bg-sky-600"}`}
          onClick={() => setFilter("PAUSED")}
        >
          Paused
        </button>
        <button
          className={`w-24 rounded-sm uppercase text-white ${filter === "DROPPED" ? "bg-red-300" : "bg-sky-600"}`}
          onClick={() => setFilter("DROPPED")}
        >
          Dropped
        </button>
        <div className="h-1 w-full bg-slate-900" />
      </section>

      <section className="flex flex-col gap-8">{FinalTable}</section>
    </main>
  );
}
