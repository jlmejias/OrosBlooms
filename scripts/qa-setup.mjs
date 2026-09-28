import { spawnSync } from "node:child_process";
import nextEnv from "@next/env";
import pg from "pg";
import safety from "./e2e-safety.cjs";

const { assertSafeE2eDatabaseUrl, buildE2eEnvironment } = safety;

nextEnv.loadEnvConfig(process.cwd());
const source = process.env.QA_DATABASE_URL || process.env.DATABASE_URL;
if (!source) throw new Error("Configura QA_DATABASE_URL o una DATABASE_URL local.");
const url = new URL(source);
if (!process.env.QA_DATABASE_URL) url.pathname = `/${url.pathname.slice(1).replace(/_(qa|test)$/i, "")}_qa`;
const { database } = assertSafeE2eDatabaseUrl(url.toString());

const adminUrl = new URL(url); adminUrl.pathname = "/postgres";
const admin = new pg.Client({ connectionString: adminUrl.toString() });
await admin.connect();
try {
  const exists = await admin.query("select 1 from pg_database where datname = $1", [database]);
  if (!exists.rowCount) await admin.query(`CREATE DATABASE "${database.replaceAll('"', '""')}"`);
} finally { await admin.end(); }

const env = { ...buildE2eEnvironment(process.env), DATABASE_URL: url.toString(), ZELLE_RECIPIENT: process.env.ZELLE_RECIPIENT || "payments@orosblooms.qa" };
for (const args of [["run", "qa:cleanup-files"], ["run", "db:migrate"], ["run", "db:clear", "--", "--confirm"], ["run", "db:seed"], ["run", "db:check-business"]]) {
  const result = spawnSync("npm", args, { cwd: process.cwd(), env, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
process.stdout.write(`Entorno QA listo en la base local ${database}.\n`);
