import {
  type seasonTable,
  type seasonWatchedTable,
  type seriesTable,
  type seriesWatchedTable,
  type userInfoTable,
  type userTable,
} from "./schema";

export interface DBErorr extends Error {
  severity_local: string;
  severity: string;
  code: number;
  routing: string;
}

export type StatusWatchedType =
  | "PLANNING"
  | "WATCHING"
  | "COMPLETED"
  | "DROPPED"
  | "PAUSED"
  | null;

export type DBUserType = typeof userTable.$inferSelect;

export type DBUserInfoType = typeof userInfoTable.$inferSelect;

export type DBSerieType = typeof seriesTable.$inferSelect;

export type DBSeriesWatchedTableType = typeof seriesWatchedTable.$inferSelect;

export type DBSeasonType = typeof seasonTable.$inferSelect;

export type DBSeasonsWatchedDB = typeof seasonWatchedTable.$inferSelect;

export type DBSerieWatchedType = typeof seriesWatchedTable.$inferSelect;

export type DBSeasonWatchedType = typeof seasonWatchedTable.$inferSelect;

export const DRIZZLE_ERROR_CODE: Record<string, string> = {
  "23505": "Username already in use",
  "69": "Yes this is a good juk, cause i'm funny like that",
};

export interface DrizzleDBError {
  severity_local: string;
  severity: string;
  code: number;
  detail: string;
  schema_name: string;
  table_name: string;
  constraint_name: string;
  file: string;
  line: number;
  routine: string;
}
