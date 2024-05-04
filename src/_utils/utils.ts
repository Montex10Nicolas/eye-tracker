// Convert US date in EU date
export function displayHumanDate(date: string) {
  if (date === undefined) {
    return date;
  }

  const parts = date.split("-");
  if (parts.length < 3) {
    return date;
  }

  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

export const TMDB_IMAGE_URL = function (image_url: string) {
  return `https://image.tmdb.org/t/p/original/${image_url}`;
};
