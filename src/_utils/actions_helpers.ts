import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";
import { db } from "~/server/db";
import {
  episodeTable,
  episodeWatchedTable,
  seasonTable,
  seasonWatchedTable,
  seriesTable,
  seriesWatchedTable,
  userInfoTable,
} from "~/server/db/schema";
import {
  type SerieType,
  type SeriesWatchedTableType,
  type UserInfo,
} from "~/server/db/types";
import { getSeasonDetail } from "~/server/queries";
import { type Episode, type Season, type TVDetail } from "~/types/tmdb_detail";

export async function getOrCreateInfo(userId: string) {
  let info: UserInfo | undefined = await db.query.userInfoTable.findFirst({
    where: (user, { eq }) => eq(userInfoTable.userId, userId),
  });

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
  tvSeasonCompleted = 0,
  tvSeasonWatching = 0,
) {
  const info = await getOrCreateInfo(userId);

  function v(start: number, finish: number): number {
    return start + finish;
  }

  const newCount = v(info.movieCountTotal, movieCountTotal),
    newDuration = v(info.movieDurationTotal, movieDurationTotal),
    newTVCount = v(info.tvEpisodeCount, tvEpisodeCount),
    newTvDuration = v(info.tvDurationTotal, tvDurationTotal),
    newTVWatching = v(info.tvSeasonWatching, tvSeasonWatching),
    newTVCompleted = v(info.tvSeasonCompleted, tvSeasonCompleted);
  await db
    .update(userInfoTable)
    .set({
      movieCountTotal: newCount,
      movieDurationTotal: newDuration,
      tvDurationTotal: newTvDuration,
      tvEpisodeCount: newTVCount,
      tvSeasonCompleted: newTVCompleted,
      tvSeasonWatching: newTVWatching,
    })
    .where(eq(userInfoTable.userId, userId));
}

async function getOrCreateTVSeries(serieId: string, series: TVDetail) {
  let tvSeries = await db.query.seriesTable.findFirst({
    where: (serie, { eq }) => eq(serie.id, serieId),
  });

  if (tvSeries === undefined) {
    tvSeries = await createTVSeries(serieId, series);
  }

  return tvSeries;
}

export async function getOrCreateTVSeriesWatched(
  serieId: string,
  userId: string,
) {
  let tvSeriesWatched = await db.query.seriesWatchedTable.findFirst({
    where: (data, { eq, and }) =>
      and(eq(data.serieId, serieId), eq(data.userId, userId)),
  });

  if (tvSeriesWatched === undefined) {
    tvSeriesWatched = await createTVSeriesWatched(serieId, userId);
  }

  return tvSeriesWatched;
}

async function createTVSeries(serieId: string, series: TVDetail) {
  const serie = await db
    .insert(seriesTable)
    .values({
      id: serieId,
      serie_data: series,
      name: series.name,
    })
    .returning();
  if (serie[0] === undefined) throw new Error("WTF");
  return serie[0] as SerieType;
}

export async function createTVSeriesWatched(serieId: string, userId: string) {
  const id = generateId(32);

  const serie = await db
    .insert(seriesWatchedTable)
    .values({
      id: id,
      serieId: serieId,
      userId: userId,
      status: "not_started",
    })
    .returning();

  return (serie[0] as SeriesWatchedTableType) ?? null;
}

async function createTVSeasonsWatched(
  seasonId: string,
  userId: string,
  serieId: string,
) {
  "use server";
  const id = generateId(32);

  const tvWatched = await db
    .insert(seasonWatchedTable)
    .values({
      id: id,
      seasonId: seasonId,
      userId: userId,
      status: "watching",
      serieId: serieId,
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
    })
    .returning();

  if (season_db[0] === undefined) {
    throw new Error("season should not be undefined");
  }
  return season_db[0];
}

async function createEpisode(seasonId: string, episode: Episode) {
  const ep_id = episode.id.toString();

  const res = await db
    .insert(episodeTable)
    .values({
      id: ep_id,
      seasonId: seasonId,
      episodeDate: episode,
    })
    .returning();
  if (res[0] === undefined) {
    throw new Error("episode should not be undefined");
  }
  return res[0];
}

async function createEpisodes(season: Season, serieId: string) {
  "use server";
  const seasonId = season.id.toString();
  const seasonDet = await getSeasonDetail(serieId, season.season_number);

  const episodes: { id: string; seasonId: string; episodeDate: Episode }[] = [];
  for (const episode of seasonDet.episodes) {
    const ep_db = await createEpisode(seasonId, episode);
    episodes.push(ep_db);
  }

  return episodes;
}

async function getOrCreateEpisodeWatched(
  userId: string,
  seasonId: string,
  episode: Episode,
) {
  const epId = episode.id.toString();

  const episodeWatch = await db.query.episodeWatchedTable.findFirst({
    where: (ses, { and, eq }) =>
      and(eq(ses.userId, userId), eq(ses.episodeId, epId)),
  });

  if (episodeWatch === undefined) {
    const dur = episode.runtime ?? 0;

    await db.insert(episodeWatchedTable).values({
      id: generateId(32),
      duration: dur,
      episodeId: epId,
      userId: userId,
      seasonId: seasonId,
    });

    return true;
  }

  return false;
}

export async function createEpisodesWatched(
  userId: string,
  seasonId: string,
  episodes: Episode[],
) {
  let ep_count = 0,
    duration = 0;
  for (const episode of episodes) {
    const added = await getOrCreateEpisodeWatched(userId, seasonId, episode);

    if (added) {
      ep_count++;
      duration += episode.runtime ?? 0;
    }
  }

  await updateInfo(userId, 0, 0, duration, ep_count, 1, -1);
}

async function getOrCreateSeason(
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

async function getOrCreateEpisodes(
  serieId: string,
  seasonId: string,
  season: Season,
) {
  let episode_db = await db.query.episodeTable.findMany({
    where: (ep, { eq }) => eq(ep.seasonId, seasonId),
  });

  if (episode_db === undefined || episode_db.length === 0) {
    episode_db = await createEpisodes(season, serieId);
  }

  return episode_db;
}

// Create series, season and episode data if they don't exist
export async function getOrCreateFullTVData(season: Season, serie: TVDetail) {
  "use server";
  const serieId = serie.id.toString();
  const seasonId = season.id.toString();

  const serie_db = await getOrCreateTVSeries(serieId, serie);
  const season_db = await getOrCreateSeason(
    seasonId,
    season,
    serieId,
    serie.name,
  );
  const episodes = await getOrCreateEpisodes(serieId, seasonId, season);

  return {
    serie: serie_db,
    season: season_db,
    episodes: episodes,
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
    seasonWatched = await createTVSeasonsWatched(seasonId, userId, serieId);
  }

  return seasonWatched;
}

export async function updateSerieWatch(
  serieId: string,
  userId: string,
  status: "watching" | "completed",
) {
  await getOrCreateTVSeriesWatched(serieId, userId);

  await db
    .update(seriesWatchedTable)
    .set({ status: status })
    .where(
      and(
        eq(seriesWatchedTable.serieId, serieId),
        eq(seriesWatchedTable.userId, userId),
      ),
    );
}

export async function updateSeasonWatch(
  seasonId: string,
  serieId: string,
  userId: string,
  status: "watching" | "completed",
) {
  await getOrCreateTVSeasonWatched(userId, serieId, seasonId);

  await db
    .update(seasonWatchedTable)
    .set({
      status: status,
    })
    .where(
      and(
        eq(seasonWatchedTable.seasonId, seasonId),
        eq(seasonWatchedTable.userId, userId),
      ),
    );
}

export async function checkSeasonCompleted(userId: string, seasonId: string) {
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
    return false;
  }

  const ep_count = season.season.season_data.episode_count;

  const episodes = await db.query.episodeWatchedTable.findMany({
    with: {
      episode: true,
    },
    where: (epWa, { and, eq }) =>
      and(eq(epWa.userId, userId), eq(episodeTable.seasonId, seasonId)),
  });

  return ep_count === episodes.length;
}

export async function checkSeriesCompleted(userId: string, serieId: string) {
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
    return false;
  }

  const season_count = serie.serie.serie_data.seasons.length;

  const seasons = await db.query.seasonWatchedTable.findMany({
    where: (seaWa, { and, eq }) =>
      and(
        eq(seasonWatchedTable.userId, userId),
        eq(seasonWatchedTable.serieId, serieId),
      ),
  });

  return season_count === seasons.length;
}

export async function updateInfoWatchComp(userId: string) {
  const all = await db.query.seasonWatchedTable.findMany({
    where: (season, { eq, and, or }) =>
      and(
        eq(seasonWatchedTable.userId, userId),
        or(
          eq(seasonWatchedTable.status, "completed"),
          eq(seasonWatchedTable.status, "watching"),
        ),
      ),
  });

  let watching = 0,
    completed = 0;
  for (const res of all) {
    if (res.status === "watching") watching++;
    if (res.status === "completed") completed++;
  }

  await db
    .update(userInfoTable)
    .set({
      tvSeasonCompleted: completed,
      tvSeasonWatching: watching,
    })
    .where(eq(userInfoTable.userId, userId));
}
