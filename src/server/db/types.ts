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

export type SerieType = typeof seriesTable.$inferSelect;

export type SeriesWatchedTableType = typeof seriesWatchedTable.$inferSelect;

export type SeasonType = typeof seasonTable.$inferSelect;

export type SeasonsWatchedDB = typeof seasonWatchedTable.$inferSelect;

export type UserInfo = typeof userInfoTable.$inferSelect;

export type SerieDBType = typeof seriesTable.$inferSelect;

export type SerieWatchedType = typeof seriesWatchedTable.$inferSelect;

export type SeasonWatchedType = typeof seasonWatchedTable.$inferSelect;

export const CODES_STATUS: number[] = [23505];

export function generateErrorMessage(code: number) {
  switch (code) {
    case 23505:
      return "This item already exist";
    default:
      return "Hello";
  }
}
