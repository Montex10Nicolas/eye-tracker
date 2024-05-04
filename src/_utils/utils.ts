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
