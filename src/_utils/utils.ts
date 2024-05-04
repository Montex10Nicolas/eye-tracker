import { year } from "drizzle-orm/mysql-core";

// Convert US date in EU date
export function displayHumanDate(date: string) {
  const parts = date.split("-");
  if (parts.length < 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export const TMDB_IMAGE_URL = function (image_url: string) {
  return `https://image.tmdb.org/t/p/original/${image_url}`;
};

export function ageCalculator(d1: Date, d2: Date) {
  let years = d2.getFullYear() - d1.getFullYear();
  const months = d2.getMonth() - d1.getMonth();
  if (months < 0) years--;

  return years;
}
