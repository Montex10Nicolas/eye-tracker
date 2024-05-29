import { and, asc, count, desc, eq } from "drizzle-orm";
import { type UpdateSeasonWatchData } from "~/app/(root)/detail/actions";
import { db } from "~/server/db";
import {
  moviesTable,
  seasonTable,
  seasonWatchedTable,
  seriesTable,
  seriesWatchedTable,
  userInfoTable,
} from "~/server/db/schema";
import {
  type DBSeasonWatchedType,
  type DBSerieWatchedType,
  type DBUserInfoType,
  type StatusWatchedType,
} from "~/server/db/types";
import { type MovieDetail, type Season, type Serie } from "~/types/tmdb_detail";
import { changeDateInvoValue } from "./utils";

export async function getOrCreateInfo(userId: string) {
  let info: DBUserInfoType | undefined = await db.query.userInfoTable.findFirst(
    {
      where: (user, { eq }) => eq(userInfoTable.userId, userId),
    },
  );

  if (info === undefined) {
    const temp = await db
      .insert(userInfoTable)
      .values({
        userId: userId,
      })
      .returning();
    if (temp[0] === undefined) {
      throw new Error("Error");
    } else {
      info = temp[0];
    }
  }

  return info;
}

export async function updateInfo(
  userId: string,
  movieDurationTotal = 0,
  movieCountTotal = 0,
  tvDurationTotal = 0,
  tvEpisodeCount = 0,
  tvSerieCompleted = 0,
  tvSerieWatching = 0,
) {
  const info = await getOrCreateInfo(userId);

  // I'm not sure why i did it like this
  function mySum(start: number, finish: number): number {
    return start + finish;
  }

  const newCount = mySum(info.movieWatched, movieCountTotal),
    newDuration = mySum(info.movieDurationTotal, movieDurationTotal),
    newTVCount = mySum(info.tvEpisodeCount, tvEpisodeCount),
    newTvDuration = mySum(info.tvDurationTotal, tvDurationTotal),
    newTVWatching = mySum(info.tvSerieWatching, tvSerieWatching),
    newTVCompleted = mySum(info.tvSerieCompleted, tvSerieCompleted);
  await db
    .update(userInfoTable)
    .set({
      movieWatched: newCount,
      movieDurationTotal: newDuration,
      tvDurationTotal: newTvDuration,
      tvEpisodeCount: newTVCount,
      tvSerieCompleted: newTVCompleted,
      tvSerieWatching: newTVWatching,
    })
    .where(eq(userInfoTable.userId, userId));
}

async function updateMovie(movieId: string, movie: MovieDetail) {
  const mov = await db
    .update(moviesTable)
    .set({
      movie_data: movie,
    })
    .where(eq(moviesTable.id, movieId))
    .returning();
  if (mov[0] === undefined) throw new Error("Movie should be able to update");
  return mov[0];
}

async function createMovie(movieId: string, movie: MovieDetail) {
  const mov = await db
    .insert(moviesTable)
    .values({
      id: movieId,
      movie_data: movie,
    })
    .returning();
  if (mov[0] !== undefined) {
    return mov[0];
  }
}

export async function getOrCreateMovie(movieId: string, movie: MovieDetail) {
  let movie_db = await db.query.moviesTable.findFirst({
    where: (mov, { eq }) => eq(mov.id, movieId),
  });

  if (movie_db === undefined) {
    movie_db = await createMovie(movieId, movie);
  }

  movie_db = await updateMovie(movieId, movie);

  return movie_db;
}

async function updateSeries(serieId: string, serie: Serie) {
  const serie_db = await db
    .update(seriesTable)
    .set({
      serie_data: serie,
    })
    .where(eq(seriesTable.id, serieId))
    .returning();
  if (serie_db[0] === undefined) throw new Error("How serie is undefined");
  return serie_db[0];
}

export async function getOrCreateTVSeries(serieId: string, series: Serie) {
  let tvSeries = await db.query.seriesTable.findFirst({
    where: (serie, { eq }) => eq(serie.id, serieId),
  });

  if (tvSeries === undefined) {
    tvSeries = await createTVSeries(serieId, series);
  }

  tvSeries = await updateSeries(serieId, series);

  return tvSeries;
}

export async function getTVSeriesWatched(userId: string, serieId: string) {
  return await db.query.seriesWatchedTable.findFirst({
    where: (data, { eq, and }) =>
      and(eq(data.serieId, serieId), eq(data.userId, userId)),
  });
}

export async function getOrCreateTVSeriesWatched(
  serieId: string,
  userId: string,
) {
  const tvSeriesWatched: DBSerieWatchedType | undefined =
    await db.query.seriesWatchedTable.findFirst({
      where: (data, { eq, and }) =>
        and(eq(data.serieId, serieId), eq(data.userId, userId)),
    });

  if (tvSeriesWatched === undefined) {
    const newTVSW = await createTVSeriesWatched(serieId, userId);
    return newTVSW;
  }

  return tvSeriesWatched;
}

async function createTVSeries(serieId: string, series: Serie) {
  const serie = await db
    .insert(seriesTable)
    .values({
      id: serieId,
      serie_data: series,
      name: series.name,
    })
    .returning();
  if (serie[0] === undefined) throw new Error("WTF");
  return serie[0];
}

export async function createTVSeriesWatched(serieId: string, userId: string) {
  const serie: DBSerieWatchedType[] = await db
    .insert(seriesWatchedTable)
    .values({
      serieId: serieId,
      userId: userId,
    })
    .returning();

  return serie[0]!;
}

async function createTVSeasonsWatched(
  seasonId: string,
  userId: string,
  serieId: string,
  serieWatchId: number,
) {
  "use server";

  const tvWatched = await db
    .insert(seasonWatchedTable)
    .values({
      userId: userId,
      serieWatch: serieWatchId,
      serieId: serieId,
      seasonId: seasonId,
      episodeWatched: 0,
    })
    .returning();

  if (tvWatched[0] === undefined) {
    throw new Error("wtf tv season should exist");
  }
  return tvWatched[0];
}

async function createTVSeason(
  seasonId: string,
  season: Season,
  serieId: string,
  serieName: string,
) {
  const season_db = await db
    .insert(seasonTable)
    .values({
      id: seasonId,
      seriesId: serieId,
      seasonName: season.name,
      serieName: serieName,
      season_data: season,
      episodeCount: season.episode_count,
    })
    .returning();

  if (season_db[0] === undefined) {
    throw new Error("season should not be undefined");
  }
  return season_db[0];
}

export async function getOrCreateTVSeason(
  seasonId: string,
  season: Season,
  serieId: string,
  serieName: string,
) {
  let seasonDB = await db.query.seasonTable.findFirst({
    where: (ses, { eq }) => eq(ses.id, seasonId),
  });

  if (seasonDB === undefined) {
    seasonDB = await createTVSeason(seasonId, season, serieId, serieName);
  }

  return seasonDB;
}

// Create series, season and episode data if they don't exist
export async function getOrCreateFullTVData(season: Season, serie: Serie) {
  "use server";
  const serieId = serie.id.toString();
  const seasonId = season.id.toString();

  const serie_db = await getOrCreateTVSeries(serieId, serie);
  const season_db = await getOrCreateTVSeason(
    seasonId,
    season,
    serieId,
    serie.name,
  );

  return {
    serie: serie_db,
    season: season_db,
  };
}

export async function getOrCreateTVSeasonWatched(
  userId: string,
  serieId: string,
  seasonId: string,
) {
  let seasonWatched = await db.query.seasonWatchedTable.findFirst({
    where: (season, { and, eq }) =>
      and(
        eq(seasonWatchedTable.seasonId, seasonId),
        eq(seasonWatchedTable.userId, userId),
      ),
  });

  if (seasonWatched === undefined) {
    const serieWatch = await getOrCreateTVSeriesWatched(serieId, userId);
    if (serieWatch === undefined) {
      throw new Error("How can it be undeinfed");
    }
    const serieWatchId = serieWatch.id;

    seasonWatched = await createTVSeasonsWatched(
      seasonId,
      userId,
      serieId,
      serieWatchId,
    );
  }

  return seasonWatched;
}

export async function updateOrCreateSerieWatch(
  serieId: string,
  userId: string,
  status: StatusWatchedType,
  seasonCount: number,
) {
  const serie = await getOrCreateTVSeriesWatched(serieId, userId);

  await db
    .update(seriesWatchedTable)
    .set({ status: status, seasonCount: seasonCount })
    .where(eq(seriesWatchedTable.id, serie.id));
}

// This is probably useless
export async function updateSeasonWatch(
  seasonWatchId: number,
  updateInfo: UpdateSeasonWatchData,
) {
  const { episodeCount, status } = updateInfo;
  await db
    .update(seasonWatchedTable)
    .set({
      status: status,
      episodeWatched: episodeCount,
    })
    .where(eq(seasonWatchedTable.id, seasonWatchId));
}

// DB the ID of the record not the seasonId
export async function updateSeasonCompletitionByUser(
  userId: string,
  serieId: string,
) {
  const seasons = await db.query.seasonWatchedTable.findMany({
    where: (ses, { and, eq }) =>
      and(eq(ses.userId, userId), eq(ses.serieId, serieId)),
    with: {
      season: true,
    },
  });

  for (const seasonWatch of seasons) {
    const status: StatusWatchedType | null =
      seasonWatch.episodeWatched === 0
        ? "PLANNING"
        : seasonWatch.episodeWatched === seasonWatch.season.episodeCount
          ? "COMPLETED"
          : (seasonWatch.status as StatusWatchedType | null);

    await db
      .update(seasonWatchedTable)
      .set({
        status: status,
      })
      .where(eq(seasonWatchedTable.id, seasonWatch.id));
  }
}

export async function updateSeasonCompletitionByID(DBSeasonID: number) {
  const seasonWatch = await db.query.seasonWatchedTable.findFirst({
    where: (ses, { eq }) => eq(ses.id, DBSeasonID),
    with: {
      season: true,
    },
  });
  if (seasonWatch === undefined) {
    throw new Error("How is undefined");
  }

  const status: StatusWatchedType =
    seasonWatch.episodeWatched === 0
      ? "PLANNING"
      : seasonWatch.episodeWatched === seasonWatch.season.episodeCount
        ? "COMPLETED"
        : "WATCHING";

  await db
    .update(seasonWatchedTable)
    .set({
      status: status,
      ended: null,
    })
    .where(eq(seasonWatchedTable.id, DBSeasonID));
}

export async function updateOrCreateOrDeleteSeasonWatch(
  seasonId: string,
  serieId: string,
  userId: string,
  updateInfo: UpdateSeasonWatchData,
): Promise<[DBSeasonWatchedType, DBSeasonWatchedType | null]> {
  const before = await getOrCreateTVSeasonWatched(userId, serieId, seasonId);

  const { episodeCount, status, started, ended } = updateInfo;

  // This means the user wants to delete the season record
  // This was also (episodeCount === 0) see if anything is broken
  if (episodeCount === -1) {
    const deletedRecord = await db
      .delete(seasonWatchedTable)
      .where(
        and(
          eq(seasonWatchedTable.userId, userId),
          eq(seasonWatchedTable.seasonId, seasonId),
        ),
      )
      .returning();

    if (deletedRecord[0] === undefined) {
      throw new Error("How can it be undefined");
    }

    return [deletedRecord[0], null];
  }

  let startedUTC;
  if (started === undefined) {
    startedUTC = before.started;
  } else {
    startedUTC = changeDateInvoValue(started);
  }
  let endedUTC;
  if (ended === undefined) {
    endedUTC = before.ended;
  } else {
    endedUTC = changeDateInvoValue(ended);
  }

  const newData = await db
    .update(seasonWatchedTable)
    .set({
      status: status,
      episodeWatched: episodeCount,
      started: startedUTC ?? null,
      ended: endedUTC ?? null,
    })
    .where(eq(seasonWatchedTable.id, before.id))
    .returning();

  if (newData[0] === undefined) throw new Error("I can newData be undefined");

  const after = newData[0];

  return [before, after];
}

export async function checkIfSeasonIsCompleted(
  userId: string,
  seasonId: string,
) {
  const season = await db.query.seasonWatchedTable.findFirst({
    where: (ses, { and, eq }) =>
      and(
        eq(seasonWatchedTable.userId, userId),
        eq(seasonWatchedTable.seasonId, seasonId),
      ),
    with: {
      season: true,
    },
  });

  if (season === undefined) {
    return {
      isSeasonCompleted: false,
      episodeCount: 0,
    };
  }

  const ep_count = season.season.season_data.episode_count;

  return ep_count === season.episodeWatched;
}

export async function checkIfSerieIsCompleted(userId: string, serieId: string) {
  const serie = await db.query.seriesWatchedTable.findFirst({
    where: (ser, { and, eq }) =>
      and(
        eq(seasonWatchedTable.userId, userId),
        eq(seasonWatchedTable.serieId, serieId),
      ),
    with: {
      serie: true,
    },
  });

  if (serie === undefined) {
    return {
      completed: false,
      seasonCount: 0,
    };
  }

  const season_count = serie.serie.serie_data.seasons.length;

  const seasons = await db.query.seasonWatchedTable.findMany({
    where: (_, { and, eq }) =>
      and(
        eq(seasonWatchedTable.userId, userId),
        eq(seasonWatchedTable.serieId, serieId),
        eq(seasonWatchedTable.status, "COMPLETED"),
      ),
  });

  return {
    completed: season_count === seasons.length,
    seasonCount: season_count,
  };
}

export async function updateSerieStatusWatch(userId: string, serieId: string) {
  const query = await db.query.seriesWatchedTable.findFirst({
    where: (serieWatch, { eq, and }) =>
      and(eq(serieWatch.userId, userId), eq(serieWatch.serieId, serieId)),
    with: {
      seasonWatched: {
        with: {
          season: true,
        },
      },
      serie: true,
    },
  });

  if (query === undefined) return;

  const {
    serie: { serie_data: serie },
    seasonWatched,
  } = query;

  // I think I can do this
  if (seasonWatched.length === 0) {
    await db
      .delete(seriesWatchedTable)
      .where(eq(seriesWatchedTable.id, query.id));
    return;
  }

  let isCompleted = true;
  let lastStatus: StatusWatchedType | null = null;

  if (serie.seasons.length === seasonWatched.length) {
    for (const seasonWatch of seasonWatched) {
      if (seasonWatch.status !== "COMPLETED") {
        isCompleted = false;
        lastStatus = seasonWatch.status as StatusWatchedType;
        break;
      }
    }
  } else {
    isCompleted = false;
  }

  const allStartDate = seasonWatched.map((el) => el.started);
  const allEndDate = seasonWatched.map((el) => el.ended);

  function getStartOrEndDate(all: (string | null)[], started: boolean) {
    let now: string | null = null;

    for (const start of all) {
      if (start === null) continue;
      if (now === null) now = start;
      const compare = new Date(start);
      const oldest = new Date(now);
      if (started && compare < oldest) {
        now = start;
      } else if (!started && compare > oldest) {
        now = start;
      }
    }

    return now;
  }

  const starter = getStartOrEndDate(allStartDate, true);
  const ender = isCompleted ? getStartOrEndDate(allEndDate, false) : null;

  await db
    .update(seriesWatchedTable)
    .set({
      status: isCompleted ? "COMPLETED" : lastStatus,
      started: starter,
      ended: ender,
    })
    .where(
      and(
        eq(seriesWatchedTable.userId, userId),
        eq(seriesWatchedTable.serieId, serieId),
      ),
    );
}

export async function updateInfoWatchComp(userId: string) {
  const seriesStatus = await db
    .select({
      count: count(seriesWatchedTable.status),
      status: seriesWatchedTable.status,
    })
    .from(seriesWatchedTable)
    .where(eq(seriesWatchedTable.userId, userId))
    .groupBy(seriesWatchedTable.status);

  const seasonsStatus = await db
    .select({
      count: count(seasonWatchedTable.status),
      status: seasonWatchedTable.status,
    })
    .from(seasonWatchedTable)
    .where(eq(seasonWatchedTable.userId, userId))
    .groupBy(seasonWatchedTable.status);

  function returnAllStatus(all: typeof seasonsStatus) {
    const planning = all.find((c) => c.status === "PLANNING")?.count;
    const watching = all.find((c) => c.status === "WATCHING")?.count;
    const completed = all.find((c) => c.status === "COMPLETED")?.count;
    const dropped = all.find((c) => c.status === "DROPPED")?.count;
    const paused = all.find((c) => c.status === "PAUSED")?.count;

    return [planning, watching, completed, dropped, paused];
  }

  const [
    seasonPlanning,
    seasonWatching,
    seasonCompleted,
    seasonDropped,
    seasonPaused,
  ] = returnAllStatus(seasonsStatus);

  const [
    seriePlannig,
    serieWatching,
    serieCompleted,
    serieDropped,
    seriePaused,
  ] = returnAllStatus(seriesStatus);

  await db
    .update(userInfoTable)
    .set({
      tvSeasonPlanned: seasonPlanning,
      tvSeasonWatching: seasonWatching,
      tvSeasonCompleted: seasonCompleted,
      tvSeasonDropped: seasonDropped,
      tvSeasonPaused: seasonPaused,

      tvSeriePlanned: seriePlannig,
      tvSerieCompleted: serieCompleted,
      tvSerieWatching: serieWatching,
      tvSerieDropped: serieDropped,
      tvSeriePaused: seriePaused,
    })
    .where(eq(userInfoTable.userId, userId));
}
