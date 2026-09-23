import type { Config } from "drizzle-kit";
import { serverEnv } from "./lib/env";

export default {
  dialect: "postgresql",
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dbCredentials: { url: serverEnv.DATABASE_URL },
} satisfies Config;
