import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import { db } from "~/server/db";
import { sessionTable, userTable } from "~/server/db/schema";

export const adapter = new DrizzlePostgreSQLAdapter(
  db,
  sessionTable,
  userTable,
);
