import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { db } from "~/server/db";
import {
  episodeTable,
  seasonTable,
  seasonWatchedTable,
  seriesTable,
  seriesWatchedTable,
  userInfoTable,
} from "~/server/db/schema";
import {
  type SeasonType,
  type SerieDBType,
  type SerieType,
  type SeriesWatchedTableType,
  type UserInfo,
} from "~/server/db/types";
import { getSeasonDetail } from "~/server/queries";
import { type Episode, type Season, type TVDetail } from "~/types/tmdb_detail";

export async function getOrCreateInfo(userId: string) {
  let info: UserInfo | undefined = await db.query.userInfoTable.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
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
  operation: "add" | "set",
  movieDurationTotal = 0,
  movieCountTotal = 0,
  tvDurationTotal = 0,
  tvEpisodeCount = 0,
  tvSeasonCompleted = 0,
  tvSeasonWatching = 0,
) {
  if (operation === "set") {
    await db
      .update(userInfoTable)
      .set({
        movieCountTotal: movieCountTotal,
        movieDurationTotal: movieDurationTotal,
        tvEpisodeCount: tvEpisodeCount,
        tvDurationTotal: tvDurationTotal,
        tvSeasonWatching: tvSeasonWatching,
        tvSeasonCompleted: tvSeasonCompleted,
      })
      .where(eq(userInfoTable.userId, userId));
    return;
  }

  const info = await getOrCreateInfo(userId);

  function v(ope: typeof operation, start: number, finish: number): number {
    return start + finish;
  }

  const newCount = v(operation, info.movieCountTotal, movieCountTotal),
    newDuration = v(operation, info.movieDurationTotal, movieDurationTotal),
    newTVCount = v(operation, info.tvEpisodeCount, tvEpisodeCount),
    newTvDuration = v(operation, info.tvDurationTotal, tvDurationTotal),
    newTVWatching = v(operation, info.tvSeasonWatching, tvSeasonWatching),
    newTVCompleted = v(operation, info.tvSeasonCompleted, tvSeasonCompleted);
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

async function getOrCreateTVSeriesWatched(serieId: string, userId: string) {
  let tvSeriesWatched = await db.query.seriesWatchedTable.findFirst({
    where: (data, { eq, and }) =>
      and(eq(data.seriesId, serieId), eq(data.userId, userId)),
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
      seriesId: serieId,
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

async function getOrCreateTV(serieId: string, serie: TVDetail) {
  let serieDB = await db.query.seriesTable.findFirst({
    where: (ser, { eq }) => eq(ser.id, serieId),
  });

  if (serieDB === undefined) {
    serieDB = await createTVSeries(serieId, serie);
  }

  return serieDB;
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

export async function getOrCreateFullTVData(season: Season, serie: TVDetail) {
  "use server";
  const serieId = serie.id.toString();
  const seasonId = season.id.toString();

  const serie_db = await getOrCreateTV(serieId, serie);
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
