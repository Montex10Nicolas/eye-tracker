import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";
import { db } from "~/server/db";
import {
  episodeTable,
  episodeWatchedTable,
  moviesTable,
  seasonTable,
  seasonWatchedTable,
  seriesTable,
  seriesWatchedTable,
  userInfoTable,
} from "~/server/db/schema";
import {
  type DBSeasonWatchedType,
  type DBSerieType,
  type DBSerieWatchedType,
  type SerieType,
  type SeriesWatchedTableType,
  type UserInfo,
} from "~/server/db/types";
import { queryTMDBSeasonDetail } from "~/server/queries";
import {
  type Episode,
  type MovieDetail,
  type Season,
  type SeasonDetail,
  type Serie,
} from "~/types/tmdb_detail";

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
  tvSerieCompleted = 0,
  tvSerieWatching = 0,
) {
  const info = await getOrCreateInfo(userId);

  function v(start: number, finish: number): number {
    return start + finish;
  }

  const newCount = v(info.movieCountTotal, movieCountTotal),
    newDuration = v(info.movieDurationTotal, movieDurationTotal),
    newTVCount = v(info.tvEpisodeCount, tvEpisodeCount),
    newTvDuration = v(info.tvDurationTotal, tvDurationTotal),
    newTVWatching = v(info.tvSerieWatching, tvSerieWatching),
    newTVCompleted = v(info.tvSerieCompleted, tvSerieCompleted);
  await db
    .update(userInfoTable)
    .set({
      movieCountTotal: newCount,
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

export async function getOrCreateTVSeriesWatched(
  serieId: string,
  userId: string,
) {
  let tvSeriesWatched: DBSerieWatchedType | undefined =
    await db.query.seriesWatchedTable.findFirst({
      where: (data, { eq, and }) =>
        and(eq(data.serieId, serieId), eq(data.userId, userId)),
    });

  if (tvSeriesWatched === undefined) {
    tvSeriesWatched = await createTVSeriesWatched(serieId, userId);
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
      status: "not_started",
    })
    .returning();

  return serie[0]!;
}

async function createTVSeasonsWatched(
  seasonId: string,
  userId: string,
  serieId: string,
) {
  "use server";

  const tvWatched = await db
    .insert(seasonWatchedTable)
    .values({
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
      episodeCount: season.episode_count,
    })
    .returning();

  if (season_db[0] === undefined) {
    throw new Error("season should not be undefined");
  }
  return season_db[0];
}

async function createSingleEpisode(seasonId: string, episode: Episode) {
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

async function createMultiEpisode(season: Season, serieId: string) {
  "use server";
  const seasonId = season.id.toString();
  const seasonDet: SeasonDetail = await queryTMDBSeasonDetail(
    serieId,
    season.season_number,
  );

  const episodes: { id: string; seasonId: string; episodeDate: Episode }[] = [];
  for (const episode of seasonDet.episodes) {
    const ep_db = await createSingleEpisode(seasonId, episode);
    episodes.push(ep_db);
  }

  return episodes;
}

async function createEpisodeWatched(
  userId: string,
  episodeId: string,
  seasonId: string,
  duration: number,
) {
  const ep_watched = await db
    .insert(episodeWatchedTable)
    .values({
      id: generateId(32),
      duration: duration,
      episodeId: episodeId,
      userId: userId,
      seasonId: seasonId,
    })
    .returning();

  if (ep_watched[0] !== undefined) return ep_watched[0];
}

async function getOrCreateEpisodeWatched(
  userId: string,
  seasonId: string,
  episode: Episode,
) {
  const epId = episode.id.toString();

  let episodeWatch = await db.query.episodeWatchedTable.findFirst({
    where: (ses, { and, eq }) =>
      and(eq(ses.userId, userId), eq(ses.episodeId, epId)),
  });

  if (episodeWatch === undefined) {
    const episode_duration = episode.runtime ?? 0;
    episodeWatch = await createEpisodeWatched(
      userId,
      epId,
      seasonId,
      episode_duration,
    );

    // This is probably bad but it will do for now
    await updateInfo(userId, 0, 0, episode_duration, 0, 0);
  }

  return episodeWatch;
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

  await updateInfo(userId, 0, 0, duration, ep_count, 0, 0);
}

async function deleteSingleEpisodeWatched(
  userId: string,
  seasonId: string,
  episode: Episode,
) {
  const episodeId = episode.id.toString();
  const episodeWatched = await db.query.episodeWatchedTable.findFirst({
    where: (ep) => and(eq(ep.episodeId, episodeId), eq(ep.userId, userId)),
  });

  if (episodeWatched === undefined) return;
  const deleteRecord = await db
    .delete(episodeWatchedTable)
    .where(eq(episodeWatchedTable.id, episodeWatched.id))
    .returning();
  if (deleteRecord[0] === undefined) return;
  const episodeDeleted = deleteRecord[0];
  const duration = -episodeDeleted.duration;

  await updateInfo(userId, 0, 0, duration, -1, 0, 0);
}

export async function createOrDeleteEpisodeWatched(
  userId: string,
  seasonId: string,
  episode: Episode,
  add: boolean,
) {
  if (add) {
    await getOrCreateEpisodeWatched(userId, seasonId, episode);
  } else {
    await deleteSingleEpisodeWatched(userId, seasonId, episode);
  }
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

export async function getOrCreateEpisodes(
  serieId: string,
  seasonId: string,
  season: Season,
) {
  let episode_db = await db.query.episodeTable.findMany({
    where: (ep, { eq }) => eq(ep.seasonId, seasonId),
  });

  if (episode_db === undefined || episode_db.length === 0) {
    episode_db = await createMultiEpisode(season, serieId);
  }

  return episode_db;
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

export async function updateOrCreateSerieWatch(
  serieId: string,
  userId: string,
  status: "watching" | "completed",
  seasonCount: number,
) {
  const serie = await getOrCreateTVSeriesWatched(serieId, userId);
  const newEp = seasonCount === -1 ? serie?.seasonCount : seasonCount;

  await db
    .update(seriesWatchedTable)
    .set({ status: status, seasonCount: seasonCount })
    .where(
      and(
        eq(seriesWatchedTable.serieId, serieId),
        eq(seriesWatchedTable.userId, userId),
      ),
    );
}

export async function updateOrCreateSeasonWatch(
  seasonId: string,
  serieId: string,
  userId: string,
  status: "watching" | "completed",
  episodeCount: number,
) {
  const season = await getOrCreateTVSeasonWatched(userId, serieId, seasonId);
  const newEp = episodeCount === -1 ? season.episodeWatched : episodeCount;

  await db
    .update(seasonWatchedTable)
    .set({
      status: status,
      episodeWatched: newEp,
    })
    .where(
      and(
        eq(seasonWatchedTable.seasonId, seasonId),
        eq(seasonWatchedTable.userId, userId),
      ),
    );
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

  const episodes = await db.query.episodeWatchedTable.findMany({
    with: {
      episode: true,
    },
    where: (epWa, { and, eq }) =>
      and(eq(epWa.userId, userId), eq(episodeTable.seasonId, seasonId)),
  });

  return {
    isSeasonCompleted: ep_count === episodes.length,
    episodeCount: episodes.length,
  };
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
        eq(seasonWatchedTable.status, "completed"),
      ),
  });

  return {
    completed: season_count === seasons.length,
    seasonCount: season_count,
  };
}

export async function updateInfoWatchComp(userId: string) {
  const all = await db.query.seriesWatchedTable.findMany({
    where: (serie, { eq, and, or }) =>
      and(
        eq(serie.userId, userId),
        or(eq(serie.status, "completed"), eq(serie.status, "watching")),
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
      tvSerieCompleted: completed,
      tvSerieWatching: watching,
    })
    .where(eq(userInfoTable.userId, userId));
}
