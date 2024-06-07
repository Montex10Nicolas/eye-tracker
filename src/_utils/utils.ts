// Convert US date in EU date
export function displayHumanDate(date: string | null) {
  if (date === null || date.includes("-") === false) return date;

  const parts = date.split("-");
  if (parts.length < 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export const TMDB_IMAGE_URL = function (image_url: string | null) {
  if (image_url === NOT_FOUND_POSTER || image_url === null) {
    return NOT_FOUND_POSTER;
  } else if (image_url === MISSING_PERSON) {
    return MISSING_PERSON;
  }

  return `https://image.tmdb.org/t/p/original/${image_url}`;
};

export function ageCalculator(d1: Date, d2: Date) {
  let years = d2.getFullYear() - d1.getFullYear();
  const months = d2.getMonth() - d1.getMonth();
  if (months < 0) years--;

  return years;
}

export const NOT_FOUND_POSTER = "/poster_not_found.png";
export const MISSING_PERSON = "/missing_person.webp";

export function addZero(n: number | string | undefined) {
  if (n === undefined) return;
  if (typeof n === typeof "a") {
    n = parseInt(n as string);
  }
  n = n as number;
  return n > 10 ? n.toString() : "0" + n;
}

export function changeDateInvoValue(date: Date | null | undefined) {
  if (date === null || date === undefined) return;
  const day = date.getDate(),
    month = date.getMonth() + 1,
    year = date.getFullYear();

  return `${year}-${addZero(month)}-${addZero(day)}`;
}

export function numberToGender(num: number) {
  if (num < 0 || num > 3) return "";
  switch (num) {
    case 0:
      return "Not specified";
    case 1:
      return "Female";
    case 2:
      return "Male";
    case 3:
      return "Non-binary";
  }
}
// % but get the whole and what is left
export function myModule(n: number, divident: number): [number, number] {
  const whole = Math.floor(n / divident);
  const left = n % divident;
  return [whole, left];
}

// Convert minutes into days/hours/years
export function convertMinute(start: number) {
  const [toHours, minutes] = myModule(start, 60);
  const [toDays, hours] = myModule(toHours, 24);
  const [months, days] = myModule(toDays, 31);

  return [months, days, hours, minutes] as const;
}
