// Convert US date in EU date
export function displayHumanDate(date: string | undefined) {
  if (date === undefined) {
    return date;
  }

  if (date === null) {
    return date;
  }

  const parts = date.split("-");
  if (parts.length < 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export const TMDB_IMAGE_URL = function (image_url: string) {
  return `https://image.tmdb.org/t/p/original/${image_url}`;
};

export const DateDiff = {
  inDays: function (d1: Date, d2: Date) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return Math.floor((t2 - t1) / (24 * 3600 * 1000));
  },

  inWeeks: function (d1: Date, d2: Date) {
    const t2 = d2.getTime();
    const t1 = d1.getTime();

    return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
  },

  inMonths: function (d1: Date, d2: Date) {
    const d1Y = d1.getFullYear();
    const d2Y = d2.getFullYear();
    const d1M = d1.getMonth();
    const d2M = d2.getMonth();

    return d2M + 12 * d2Y - (d1M + 12 * d1Y);
  },

  inYears: function (d1: Date, d2: Date) {
    return d2.getFullYear() - d1.getFullYear();
  },
};
