import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL es obligatoria.");
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});const db=drizzle(pool);

async function main() {
  const result = await db.execute(sql`
    SELECT
      (SELECT count(*)::int FROM categories) AS categories,
      (SELECT count(*)::int FROM products) AS products,
      (SELECT count(*)::int FROM products WHERE type = 'floral') AS floral,
      (SELECT count(*)::int FROM products WHERE type = 'complement') AS complements,
      (SELECT count(*)::int FROM products WHERE type = 'personalized') AS personalized,
      (SELECT count(*)::int FROM product_variants) AS variants,
      (SELECT count(*)::int FROM product_images) AS product_images,
      (SELECT count(*)::int FROM services) AS services,
      (SELECT count(*)::int FROM gallery_items) AS gallery_items,
      (SELECT count(*)::int FROM testimonials WHERE approved = true AND display_name = 'Ejemplo ficticio') AS public_fake_testimonials,
      (SELECT count(*)::int FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.category_id IS NOT NULL AND c.id IS NULL) AS missing_categories
  `);
  const row = result.rows[0] as Record<string,number>|undefined;
  if (!row || row.categories < 6 || row.products < 12 || row.floral < 7 || row.complements < 4 || row.personalized < 1 || row.variants < 12 || row.product_images < 4 || row.services < 3 || row.gallery_items < 3 || row.public_fake_testimonials !== 0 || row.missing_categories !== 0) {
    throw new Error(`El esquema o seed de negocio no coincide con lo esperado: ${JSON.stringify(row)}`);
  }
  process.stdout.write(`Integridad y seed repetible confirmados: ${row.products} productos, ${row.categories} categorías.\n`);
}

main().catch((error: unknown) => { process.stderr.write(`${error instanceof Error ? error.message : "Error de verificación"}\n`); process.exitCode = 1; }).finally(() => pool.end());
