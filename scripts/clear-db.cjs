const { loadEnvConfig } = require("@next/env");
const { Pool } = require("pg");

loadEnvConfig(process.cwd());

const confirmationFlag = "--confirm";
const migrationTable = "__drizzle_migrations";

function isLocalDatabase(databaseUrl) {
  const host = new URL(databaseUrl).hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL es obligatoria para limpiar la base de datos.");
  }

  if (!process.argv.includes(confirmationFlag)) {
    throw new Error(`Esta acción elimina todos los datos. Ejecútala con: npm run db:clear -- ${confirmationFlag}`);
  }

  if (!isLocalDatabase(databaseUrl)) {
    throw new Error("Por seguridad, db:clear solo permite una DATABASE_URL local.");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const { rows } = await pool.query(
      `SELECT tablename
       FROM pg_catalog.pg_tables
       WHERE schemaname = 'public' AND tablename <> $1
       ORDER BY tablename`,
      [migrationTable],
    );

    if (rows.length === 0) {
      process.stdout.write("No hay tablas de aplicación para limpiar.\n");
      return;
    }

    const tables = rows.map(({ tablename }) => `public.${quoteIdentifier(tablename)}`).join(", ");
    await pool.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
    process.stdout.write(`Base de datos limpia: ${rows.length} tablas vaciadas. Las migraciones se conservaron.\n`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "No se pudo limpiar la base de datos."}\n`);
  process.exitCode = 1;
});
