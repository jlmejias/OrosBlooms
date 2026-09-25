import { spawnSync } from "node:child_process";
import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const source = process.env.QA_DATABASE_URL || process.env.DATABASE_URL;
if (!source) throw new Error("Configura QA_DATABASE_URL o una DATABASE_URL local.");
const url = new URL(source);
if (!["localhost", "127.0.0.1", "::1"].includes(url.hostname)) throw new Error("QA solo puede prepararse en PostgreSQL local.");
if (!process.env.QA_DATABASE_URL) url.pathname = `/${url.pathname.slice(1).replace(/_(qa|test)$/i, "")}_qa`;
const database = url.pathname.slice(1);
if (!/(_qa|_test)$/i.test(database)) throw new Error("El nombre de la base QA debe terminar en _qa o _test.");

const adminUrl = new URL(url); adminUrl.pathname = "/postgres";
const admin = new pg.Client({ connectionString: adminUrl.toString() });
await admin.connect();
try {
  const exists = await admin.query("select 1 from pg_database where datname = $1", [database]);
  if (!exists.rowCount) await admin.query(`CREATE DATABASE "${database.replaceAll('"', '""')}"`);
} finally { await admin.end(); }

const env = { ...process.env, DATABASE_URL: url.toString(), NODE_ENV: "test", EMAIL_TRANSPORT: "mock", SINPE_MOBILE_NUMBER: process.env.SINPE_MOBILE_NUMBER || "70000000" };
for (const args of [["run", "db:migrate"], ["run", "db:clear", "--", "--confirm"], ["run", "db:seed"], ["run", "db:check-business"]]) {
  const result = spawnSync("npm", args, { cwd: process.cwd(), env, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
process.stdout.write(`Entorno QA listo en la base local ${database}.\n`);
