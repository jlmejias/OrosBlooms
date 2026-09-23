import type { Config } from "drizzle-kit";
import { serverEnv } from "./lib/env";

export default {
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  connectionString: serverEnv.DATABASE_URL,
} satisfies Config;
