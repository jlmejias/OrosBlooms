import { timingSafeEqual } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { createAdminSessionToken, verifyAdminSessionToken } from "@/lib/admin-session";
import { acceptsDevelopmentAdminCredentials, adminSessionSecret } from "@/lib/admin-auth-policy";

const COOKIE = "oros_admin_session";
const maxAge = 60 * 60 * 8;
const defaultAdminUsername = "OrosBlooms";
function safeEqual(a: string, b: string) { const left = Buffer.from(a); const right = Buffer.from(b); return left.length === right.length && timingSafeEqual(left, right); }

export async function getAdminAccountByUsername(username: string) {
  const [account] = await db.select({ id: users.id, username: users.username, email: users.email, passwordHash: users.passwordHash }).from(users).where(and(sql`lower(${users.username}) = lower(${username})`, eq(users.active, true))).limit(1);
  return account;
}

export async function getAdminAccountByRecoveryEmail(email: string) {
  const [account] = await db.select({ id: users.id, username: users.username, email: users.email, passwordHash: users.passwordHash }).from(users).where(and(sql`lower(${users.email}) = lower(${email})`, eq(users.active, true))).limit(1);
  return account;
}

export async function provisionInitialAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim() || defaultAdminUsername;
  const recoveryEmail = process.env.ADMIN_RECOVERY_EMAIL?.trim() || process.env.RESEND_NOTIFICATION_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!recoveryEmail || !passwordHash) return null;
  const existing = await getAdminAccountByUsername(username);
  if (existing) return existing;
  const existingRecoveryAccount = await getAdminAccountByRecoveryEmail(recoveryEmail);
  if (existingRecoveryAccount) {
    await db.update(users).set({ username, updatedAt: new Date() }).where(eq(users.id, existingRecoveryAccount.id));
    return getAdminAccountByUsername(username);
  }
  await db.insert(users).values({ username, email: recoveryEmail, passwordHash }).onConflictDoNothing();
  return getAdminAccountByUsername(username);
}

export async function createAdminSession(username: string) { const token=createAdminSessionToken(username,adminSessionSecret(),Date.now()+maxAge*1000);(await cookies()).set(COOKIE,token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge}); }
export async function getAdminSession() { const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;return verifyAdminSessionToken(token,adminSessionSecret()); }
export async function requireAdmin() { const session = await getAdminSession(); if (!session) redirect("/acceso-admin"); return session; }
export async function clearAdminSession() { (await cookies()).delete(COOKIE); }
export async function validAdminCredentials(username: string, password: string) {
  if (acceptsDevelopmentAdminCredentials()) return safeEqual(username, "oros") && safeEqual(password, "oros");
  let account = await getAdminAccountByUsername(username);
  const expectedUsername = (process.env.ADMIN_USERNAME?.trim() || defaultAdminUsername);
  const recoveryEmail = process.env.ADMIN_RECOVERY_EMAIL?.trim() || process.env.RESEND_NOTIFICATION_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim();
  if (!account && recoveryEmail && safeEqual(username.toLowerCase(), expectedUsername.toLowerCase())) account = await getAdminAccountByRecoveryEmail(recoveryEmail);
  if (account?.passwordHash) return verifyPassword(password, account.passwordHash);
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!expectedUsername || !safeEqual(username.toLowerCase(), expectedUsername.toLowerCase())) return false;
  if (!passwordHash) return false;
  return verifyPassword(password, passwordHash);
}
