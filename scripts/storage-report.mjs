import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const roots = [path.join(process.cwd(), "public", "uploads"), path.join(process.cwd(), "storage", "object-storage")];

async function filesBelow(root, directory = root) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? filesBelow(root, path.join(directory, entry.name)) : Promise.resolve([path.join(directory, entry.name)])));
    return nested.flat();
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const { rows } = await pool.query("select provider_id, url from media_assets");
  const references = new Set(rows.flatMap(row => [row.provider_id, String(row.url).replace(/^\/uploads\//, "")]).filter(Boolean));
  const files = (await Promise.all(roots.map(root => filesBelow(root)))).flat();
  const records = await Promise.all(files.map(async file => {
    const bytes = await readFile(file);
    const info = await stat(file);
    const root = roots.find(candidate => file.startsWith(candidate));
    const relative = path.relative(root, file).replaceAll("\\", "/");
    return { file: path.relative(process.cwd(), file).replaceAll("\\", "/"), relative, bytes: info.size, sha256: createHash("sha256").update(bytes).digest("hex"), used: references.has(relative) };
  }));
  const groups = Map.groupBy(records, record => record.sha256);
  const duplicates = [...groups.values()].filter(group => group.length > 1);
  const result = { generatedAt: new Date().toISOString(), summary: { files: records.length, used: records.filter(item => item.used).length, orphaned: records.filter(item => !item.used).length, duplicateGroups: duplicates.length, totalBytes: records.reduce((sum, item) => sum + item.bytes, 0) }, used: records.filter(item => item.used), orphaned: records.filter(item => !item.used), duplicates };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} finally {
  await pool.end();
}
