import { createHmac, timingSafeEqual } from "node:crypto";

function sign(payload: string, secret: string) { return createHmac("sha256", secret).update(payload).digest("base64url"); }
function safeEqual(a: string, b: string) { const left = Buffer.from(a); const right = Buffer.from(b); return left.length === right.length && timingSafeEqual(left, right); }

export function createAdminSessionToken(email: string, secret: string, expiresAt: number) {
  const payload = Buffer.from(JSON.stringify({ email, role: "admin", exp: expiresAt })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionToken(token: string, secret: string, now = Date.now()) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, secret))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { email?: unknown; role?: unknown; exp?: unknown };
    return data.role === "admin" && typeof data.email === "string" && typeof data.exp === "number" && data.exp > now ? { email: data.email, role: "admin" as const, exp: data.exp } : null;
  } catch { return null; }
}
