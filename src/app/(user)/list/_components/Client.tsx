"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
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
import { type SeriesAndSeasonWatched } from "../../user_action";

function MyTable(props: {
  data: SeriesAndSeasonWatched[];
  status: StatusWatchedType;
}) {
  const { data, status: TableStatus } = props;
  const router = useRouter();

  function Row(props: { serie: SeriesAndSeasonWatched }) {
    const {
      serie: {
        serie: {
          name,
          serie_data: { poster_path, id },
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
      <TableRow
        onClick={() => router.push(`/detail/tv/${id}`)}
        className="h-full w-full cursor-pointer bg-white text-black"
      >
        <TableCell>
          <div className="h-[80px] w-[70px] overflow-hidden">
            <Image
              src={TMDB_IMAGE_URL(poster_path)}
              alt={name}
              width={100}
              height={100}
              className="h-full w-full duration-300 ease-in-out hover:scale-125"
            />
          </div>
          <p>{name}</p>
        </TableCell>
        <TableCell>{status}</TableCell>
        <TableCell>{startedString}</TableCell>
        <TableCell>{endedString}</TableCell>
      </TableRow>
    );
  }

  return (
    <Table className="sm:text-md -z-10 text-xs">
      <TableCaption>{TableStatus} this table describe this</TableCaption>
      <TableHeader className="relative">
        <TableRow className="sticky top-0">
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Ended</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((serie) => (
          <Row serie={serie} key={serie.id} />
        ))}
      </TableBody>
      {data.length === 0 ? (
        <TableCaption>
          <h1 className="text-lg font-bold text-white sm:text-xl">
            You don&apos;t have any serie in this {TableStatus} at this moment
          </h1>
        </TableCaption>
      ) : null}
    </Table>
  );
}

export function Tables(props: {
  watching: SeriesAndSeasonWatched[];
  completed: SeriesAndSeasonWatched[];
  planned: SeriesAndSeasonWatched[];
  dropped: SeriesAndSeasonWatched[];
  paused: SeriesAndSeasonWatched[];
}) {
  const { watching, completed, planned, dropped, paused } = props;
  const [filter, setFilter] = useState<StatusWatchedType | null>(null);

  const WatchingTable = <MyTable status={"WATCHING"} data={watching} />;
  const CompletedTable = <MyTable status={"COMPLETED"} data={completed} />;
  const PlannedTable = <MyTable status={"PLANNING"} data={planned} />;
  const DroppedTable = <MyTable status={"DROPPED"} data={dropped} />;
  const PausedTable = <MyTable status={"PAUSED"} data={paused} />;

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
