import { sql } from "drizzle-orm";
import { db, pool } from "../db/client";

async function main() {
  const result = await db.execute(sql`select count(*)::int as count from foundation_checks`);
  const count = result.rows[0]?.count;
  if (typeof count !== "number") throw new Error("La tabla foundation_checks no está disponible.");
  process.stdout.write(`Conexión y migración confirmadas. Registros: ${count}.\n`);
}

main()
  .catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : "Error de base de datos"}\n`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
