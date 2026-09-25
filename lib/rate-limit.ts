import "server-only";
import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

type RateLimitOptions = { limit: number; windowSeconds: number };

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "unknown";
}

export async function consumeRateLimit(scope: string, identity: string, options: RateLimitOptions) {
  const key = createHash("sha256").update(`${scope}:${identity}`).digest("hex");
  const interval = `${options.windowSeconds} seconds`;
  const result = await db.execute<{ count: number; reset_at: Date }>(sql`
    INSERT INTO rate_limits (key, count, reset_at, updated_at)
    VALUES (${key}, 1, now() + ${interval}::interval, now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.reset_at <= now() THEN 1 ELSE rate_limits.count + 1 END,
      reset_at = CASE WHEN rate_limits.reset_at <= now() THEN now() + ${interval}::interval ELSE rate_limits.reset_at END,
      updated_at = now()
    RETURNING count, reset_at
  `);
  const row = result.rows[0];
  return { allowed: row.count <= options.limit, remaining: Math.max(0, options.limit - row.count), resetAt: row.reset_at };
}
