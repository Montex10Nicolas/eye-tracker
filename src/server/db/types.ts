import { type Episode, type Season, type Serie } from "~/types/tmdb_detail";
import {
  type seasonTable,
  type seasonWatchedTable,
  type seriesTable,
  type seriesWatchedTable,
  type userInfoTable,
} from "./schema";

export interface DBErorr extends Error {
  severity_local: string;
  severity: string;
  code: number;
  routing: string;
}

export enum Status {
  "not_started",
  "watching",
  "completed",
}

export type DBSerieType = typeof seriesTable.$inferSelect;

export type DBSeriesWatchedTableType = typeof seriesWatchedTable.$inferSelect;

export type DBSeasonType = typeof seasonTable.$inferSelect;

export type DBSeasonsWatchedDB = typeof seasonWatchedTable.$inferSelect;

export type DBUserInfo = typeof userInfoTable.$inferSelect;

export type DBSerieWatchedType = typeof seriesWatchedTable.$inferSelect;

export type DBSeasonWatchedType = typeof seasonWatchedTable.$inferSelect;

export const CODES_STATUS: number[] = [23505];

export function generateErrorMessage(code: number) {
  switch (code) {
    case 23505:
      return "This item already exist";
    default:
      return "Hello";
  }
}
