import Link from "next/link";
import {
  addEpisodeToSeasonWatched,
  markSeriesAsCompleted,
  removeAllSerie,
} from "~/app/(root)/detail/actions";
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
import { NoUser } from "../profile/_components/Client";
import { getUser, myWatchedSeries } from "../user_action";

export default async function Page(props: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { searchParams } = props;

  const tableType = searchParams.type;

  const user = await getUser();

  if (user === undefined || user === null) {
    return <NoUser />;
  }

  const userId = user.id;
  let mySerie = await myWatchedSeries(userId);

  let all: StatusWatchedType = null;
  if (
    tableType !== null &&
    tableType !== undefined &&
    typeof tableType !== "object"
  ) {
    tableType;
    const upper = tableType.toUpperCase() as StatusWatchedType;
    console.log(upper);
    if (
      upper === "COMPLETED" ||
      upper === "DROPPED" ||
      upper === "PAUSED" ||
      upper === "PLANNING" ||
      upper === "WATCHING"
    ) {
      console.log("VER");
      all = upper;
    }
  }

  if (all !== null) {
    let copy = [...mySerie];

    copy = copy.filter((value) => {
      console.log(value.status, all);
      if (value.status === all) {
        return value;
      }
    });

    mySerie = copy;
  }

  return (
    <main className="min-h-screen w-full px-2 text-white  sm:mx-auto sm:w-4/5">
      <div className="my-8 bg-primary">
        <code>
          <pre>{JSON.stringify(tableType, null, 2)}</pre>
        </code>
      </div>
      <div className="my-8 flex flex-col justify-around gap-2 bg-secondary p-4 text-white sm:flex-row sm:gap-0">
        <Link href="/list" className="bg-primary px-4 py-2">
          All
        </Link>
        <Link href={"?type=planning"} className="bg-primary px-4 py-2 ">
          Planning
        </Link>
        <Link href={"?type=watching"} className="bg-primary px-4 py-2 ">
          Watching
        </Link>
        <Link href={"?type=completed"} className="bg-primary px-4 py-2 ">
          Completed
        </Link>
        <Link href={"?type=paused"} className="bg-primary px-4 py-2 ">
          Paused
        </Link>
        <Link href={"?type=dropped"} className="bg-primary px-4 py-2 ">
          Dropped
        </Link>
      </div>

      <div className="grid h-12 w-full place-content-center bg-secondary text-center font-bold">
        {all ? all : "All"}
      </div>
      <Table>
        <TableHeader className="w-full bg-secondary">
          <TableRow>
            <TableHead>Name</TableHead>
            {all ? null : <TableHead>Status</TableHead>}
            <TableHead>Episode</TableHead>
            <TableHead>Seasons</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Ended</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-foreground">
          {mySerie.map((serieWatched) => {
            const {
              serie: {
                serie_data: {
                  name,
                  number_of_episodes,
                  number_of_seasons,
                  id: serieId,
                },
                seasons,
              },
              status,
              started,
              ended,
              updatedAt,
            } = serieWatched;
            let seasonCompleted = 0,
              episodeWatched = 0;
            seasons.forEach((value) => {
              const watchedBy = value.watchedBy[0];
              if (watchedBy === undefined) {
                return;
              }

              const {
                season_data: { season_number },
              } = value;
              const { status, episodeWatched: ep_w } = watchedBy;
              status as StatusWatchedType;

              if (season_number <= 0) {
                return;
              }

              episodeWatched += ep_w;
              if (status === "COMPLETED") {
                seasonCompleted++;
              }
            });

            return (
              <TableRow
                key={serieWatched.id}
                className="my-4 w-full p-4 text-black"
              >
                <TableCell>
                  <Link href={`/detail/tv/${serieId}`}>{name}</Link>
                </TableCell>
                {all ? null : <TableCell>{status}</TableCell>}
                <TableCell>
                  {episodeWatched}/{number_of_episodes}
                </TableCell>
                <TableCell>
                  {seasonCompleted}/{number_of_seasons}
                </TableCell>
                <TableCell>
                  {started !== null
                    ? new Date(started).toLocaleDateString()
                    : "Not set"}
                </TableCell>
                <TableCell>
                  {ended !== null
                    ? new Date(ended).toLocaleDateString()
                    : "Not set"}
                </TableCell>
                <TableCell>{updatedAt.toLocaleDateString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}
