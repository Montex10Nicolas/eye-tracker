import {
  addEpisodeToSeasonWatched,
  markSeriesAsCompleted,
  removeAllSerie,
} from "~/app/(root)/detail/actions";
import { type StatusWatchedType } from "~/server/db/types";
import { NoUser } from "../profile/_components/Client";
import {
  getUser,
  myWatchedSeries,
  type SeriesAndSeasonWatched,
} from "../user_action";
import { Tables } from "./_components/Client";

export default async function Page() {
  const user = await getUser();

  if (user === undefined || user === null) {
    return <NoUser />;
  }

  const userId = user.id;
  const mySerie = await myWatchedSeries(userId);

  const planned: SeriesAndSeasonWatched[] = [];
  const watching: SeriesAndSeasonWatched[] = [];
  const completed: SeriesAndSeasonWatched[] = [];
  const dropped: SeriesAndSeasonWatched[] = [];
  const paused: SeriesAndSeasonWatched[] = [];

  for (const serie of mySerie) {
    switch (serie.status as StatusWatchedType) {
      case "COMPLETED":
        completed.push(serie);
        break;
      case "DROPPED":
        dropped.push(serie);
        break;
      case "PAUSED":
        paused.push(serie);
        break;
      case "PLANNING":
        planned.push(serie);
        break;
      case "WATCHING":
        watching.push(serie);
        break;
    }
  }

  return (
    <main className="-z-10">
      <Tables
        completed={completed}
        watching={watching}
        planned={planned}
        dropped={dropped}
        paused={paused}
        userId={userId}
        markSerie={markSeriesAsCompleted}
        removeSerie={removeAllSerie}
        addEpisodeToSeasonWatched={addEpisodeToSeasonWatched}
      />
    </main>
  );
}
