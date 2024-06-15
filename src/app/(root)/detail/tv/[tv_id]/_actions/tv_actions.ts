import "server-only";
import { addSerieFromTMDB, updateSeries } from "~/_utils/actions_helpers";
import { db } from "~/server/db";
import { queryTMDBTVDetail } from "~/server/queries";

export async function TVGetOrUpdateSerieData(serieId: string) {
  const serie = await db.query.seriesTable.findFirst({
    where: (serie, { eq }) => eq(serie.id, serieId),
  });

  if (serie === undefined) {
    const data = await addSerieFromTMDB(serieId);
    return data;
  }

  const { serie_data, updatedAt: up } = serie;
  const updatedAt = up ?? new Date();

  // If this date was not updated in more than one week udpated it
  const now = new Date();
  const diff_in_time = now.getTime() - updatedAt.getTime();

  const diff_in_days = Math.round(diff_in_time / (1000 * 3600 * 24));

  if (diff_in_days > 7) {
    const serieData = await queryTMDBTVDetail(serieId);
    await updateSeries(serieId, serieData);

    return serieData;
  }

  return serie_data;
}
