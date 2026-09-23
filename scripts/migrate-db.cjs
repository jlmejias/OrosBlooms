const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
const { migrate } = require("drizzle-orm/node-postgres/migrator");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL es obligatoria para ejecutar migraciones.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await migrate(drizzle(pool), { migrationsFolder: "db/migrations" });
    console.log("Migraciones aplicadas.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
