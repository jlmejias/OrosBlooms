import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { serverEnv } from "@/lib/env";

const pool = new Pool({ connectionString: serverEnv.DATABASE_URL });

export const db = drizzle(pool);
export { pool };
