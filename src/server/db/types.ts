export interface DBErorr extends Error {
  severity_local: string;
  severity: string;
  code: number;
  routing: string;
}

export interface SeasonsWatchedDB {
  id: string;
  seasonId: string;
  userId: string;
  serieId: string;
  status: "not_started" | "watching" | "completed";
}

export const CODES_STATUS: number[] = [23505];

export function generateErrorMessage(code: number) {
  switch (code) {
    case 23505:
      return "This item already exist";
    default:
      return "Hello";
  }
}
