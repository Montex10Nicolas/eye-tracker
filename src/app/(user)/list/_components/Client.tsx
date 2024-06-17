"use client";

import { AccordionTrigger } from "@radix-ui/react-accordion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TMDB_IMAGE_URL, displayHumanDate } from "~/_utils/utils";
import { type UpdateSeasonWatchData } from "~/app/(root)/detail/actions";
import {
  AddBtn,
  RemoveBtn,
  SerieButton,
} from "~/app/(root)/detail/tv/[tv_id]/_components/ButtonsToast";
import { EditSeason } from "~/app/(root)/detail/tv/[tv_id]/_components/EditSeason";
import { SeasonForm } from "~/app/(root)/detail/tv/[tv_id]/_components/SeasonForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "~/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  type DBSeasonWatchedType,
  type StatusWatchedType,
} from "~/server/db/types";
import { type Season, type Serie } from "~/types/tmdb_detail";
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
  addEpisodeToSeasonWatched: (
    userId: string,
    serie: Serie,
    season: Season,
    newInfo: UpdateSeasonWatchData,
  ) => Promise<void>;
  userId: string;
}) {
  const {
    data,
    status: TableStatus,
    markSerie,
    removeSerie,
    userId,
    addEpisodeToSeasonWatched,
  } = props;
  const router = useRouter();

  // SerieAccording+SeasonsInTable
  function DisplayTable(props: {
    seasons: seasonWatchWithSeason[];
    serieData: Serie;
  }) {
    const { seasons, serieData } = props;
    const serieId = serieData.id.toString();

    // Each Season
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
      const {
        season: {
          season: { season_data: seasonData },
        },
      } = props;
      const { season: season_w } = props;

      const startedString = started
        ? displayHumanDate(new Date(started).toLocaleDateString())
        : "Not set";
      const endedString = ended
        ? displayHumanDate(new Date(ended).toLocaleDateString())
        : "Not set";

      function handleButton(
        season: Season,
        found: DBSeasonWatchedType | undefined,
      ) {
        async function DBAddSeason() {
          await addEpisodeToSeasonWatched(userId, serieData, season, {
            episodeCount: season.episode_count,
            status: "COMPLETED",
            ended: new Date(),
          });
        }

        async function DBRemoveSeason() {
          await addEpisodeToSeasonWatched(userId, serieData, season, {
            episodeCount: -1,
            status: null,
            ended: null,
            started: null,
          });
        }

        const EditBtn = (
          <div className="h-full w-full">
            <EditSeason
              myButton={
                <button className="h-full w-full cursor-pointer items-center justify-center bg-green-500 text-xs font-semibold uppercase text-white">
                  edit
                </button>
              }
            >
              <SeasonForm
                userId={userId}
                serie={serieData}
                season={season}
                addEpisode={addEpisodeToSeasonWatched}
                seasonWatch={season_w}
              />
            </EditSeason>
          </div>
        );

        const myStatus = status as StatusWatchedType;

        let customBtn: JSX.Element | null = null;

        if (myStatus === "COMPLETED") {
          customBtn = (
            <>
              {EditBtn}
              <RemoveBtn DBRemoveSeason={DBRemoveSeason} />
            </>
          );
        } else if (myStatus === "WATCHING") {
          customBtn = (
            <>
              <AddBtn DBAddSeason={DBAddSeason} />
              <RemoveBtn DBRemoveSeason={DBRemoveSeason} />
              {EditBtn}
            </>
          );
        } else {
          customBtn = (
            <>
              <AddBtn DBAddSeason={DBAddSeason} />
              {EditBtn}
            </>
          );
        }

        return (
          <div className="flex h-12 flex-col sm:flex-row">{customBtn}</div>
        );
      }

      return (
        <TableRow className="">
          <TableCell>
            <div className="h-[80px] w-[65px] overflow-hidden sm:h-[150px] sm:w-[100px]">
              <a
                className="font-semibold text-blue-600 underline"
                href={`/detail/tv/${serieId}`}
              >
                <Image
                  src={TMDB_IMAGE_URL(poster_path)}
                  alt={seasonName}
                  width={100}
                  height={100}
                  className="h-full w-full"
                />
              </a>
            </div>
            <div className="flex flex-col">
              <a
                className="font-semibold text-blue-600 underline"
                href={`/detail/tv/${serieId}`}
              >
                {seasonName}
              </a>
              {handleButton(seasonData, season_w)}
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

  // Series
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
            <div className="mx-2 my-2 flex flex-row items-center justify-between text-xs sm:mx-4">
              <div className="flex flex-col">
                {/* img + a + overflow */}
                <div className="h-[80px] w-[65px] overflow-hidden sm:h-[150px] sm:w-[100px]">
                  <a
                    href={`/detail/tv/${serieId}`}
                    className="h-[80px] w-[65px] overflow-hidden sm:h-[150px] sm:w-[100px]"
                  >
                    <Image
                      src={TMDB_IMAGE_URL(poster_path)}
                      height={150}
                      width={150}
                      alt={name}
                      className="h-full w-full duration-300 ease-in-out hover:scale-125"
                    />
                  </a>
                </div>
                <div className="w-[65px] sm:w-[100px]">
                  <a
                    href={`/detail/tv/${serieId}`}
                    className="font-bold hover:text-blue-500 hover:underline sm:text-lg"
                  >
                    {name}
                  </a>
                  <SerieButton
                    addAllSerie={addAll}
                    removeSerie={removeAll}
                    status={status as StatusWatchedType}
                  />
                </div>
              </div>
              <div className="relative mx-2 flex w-full justify-between sm:mx-4">
                <p>{status}</p>
                <p>{displayHumanDate(startedString)}</p>
                <p>{displayHumanDate(endedString)}</p>
                <p className="text-md absolute -bottom-[40px] mx-auto font-semibold text-gray-400 sm:-bottom-[80px] sm:text-lg">
                  Click to expand and see all the season{" "}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <DisplayTable seasons={seasonsWatched} serieData={serieData} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  if (data.length === 0) {
    return (
      <section className="flex h-20 items-center justify-center bg-slate-800 font-semibold text-white">
        <p className="font-bold">
          <span>You don&apos;t have any data in </span>
          <span className="">{TableStatus} </span>
          <span>right now</span>
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex h-10 items-center bg-slate-800 text-white">
        <p className="ml-4 font-bold">
          <span>All your </span>
          <span className="lowercase text-sky-300">{TableStatus}</span> serie
        </p>
      </div>
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
  addEpisodeToSeasonWatched: (
    userId: string,
    serie: Serie,
    season: Season,
    newInfo: UpdateSeasonWatchData,
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
    addEpisodeToSeasonWatched,
  } = props;
  const [filter, setFilter] = useState<StatusWatchedType | null>(null);

  const WatchingTable = (
    <MyTable
      addEpisodeToSeasonWatched={addEpisodeToSeasonWatched}
      userId={userId}
      markSerie={markSerie}
      removeSerie={removeSerie}
      status={"WATCHING"}
      data={watching}
    />
  );
  const CompletedTable = (
    <MyTable
      addEpisodeToSeasonWatched={addEpisodeToSeasonWatched}
      userId={userId}
      markSerie={markSerie}
      removeSerie={removeSerie}
      status={"COMPLETED"}
      data={completed}
    />
  );
  const PlannedTable = (
    <MyTable
      addEpisodeToSeasonWatched={addEpisodeToSeasonWatched}
      userId={userId}
      markSerie={markSerie}
      removeSerie={removeSerie}
      status={"PLANNING"}
      data={planned}
    />
  );
  const DroppedTable = (
    <MyTable
      addEpisodeToSeasonWatched={addEpisodeToSeasonWatched}
      userId={userId}
      markSerie={markSerie}
      removeSerie={removeSerie}
      status={"DROPPED"}
      data={dropped}
    />
  );
  const PausedTable = (
    <MyTable
      addEpisodeToSeasonWatched={addEpisodeToSeasonWatched}
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
    <main className="mb-4">
      {/* Filter button */}
      <section className="sticky top-[80px] z-10 flex h-full w-full flex-row flex-wrap items-center justify-around gap-y-2 border border-black bg-white pt-2 sm:flex-nowrap sm:justify-center sm:gap-8">
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
      </section>

      <section className="flex flex-col gap-8">{FinalTable}</section>
    </main>
  );
}
