import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: "postgresql",
  tablesFilter: ["siuwi-tracker_*"],
} satisfies Config;
