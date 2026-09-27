import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { adminPasswordResetTokens, users } from "@/db/schema";
import { getAdminAccountByRecoveryEmail, provisionInitialAdmin } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/password";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createAdminPasswordReset(email: string) {
  let account = await getAdminAccountByRecoveryEmail(email);
  if (!account) {
    const initialEmail = process.env.ADMIN_RECOVERY_EMAIL?.trim() || process.env.RESEND_NOTIFICATION_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim();
    if (initialEmail && initialEmail.toLowerCase() === email.toLowerCase()) {
      const initialAccount = await provisionInitialAdmin();
      if (initialAccount) account = initialAccount;
    }
  }
  if (!account) return null;
  const token = randomBytes(32).toString("base64url");
  await db.delete(adminPasswordResetTokens).where(eq(adminPasswordResetTokens.userId, account.id));
  await db.insert(adminPasswordResetTokens).values({ userId: account.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
  return { email: account.email, token };
}

export async function resetAdminPassword(token: string, password: string) {
  const [record] = await db.select({ id: adminPasswordResetTokens.id, userId: adminPasswordResetTokens.userId }).from(adminPasswordResetTokens).where(and(eq(adminPasswordResetTokens.tokenHash, hashToken(token)), isNull(adminPasswordResetTokens.usedAt), gt(adminPasswordResetTokens.expiresAt, new Date()))).limit(1);
  if (!record) return false;
  const passwordHash = await hashPassword(password, randomBytes(16).toString("base64url"));
  await db.transaction(async transaction => {
    await transaction.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, record.userId));
    await transaction.update(adminPasswordResetTokens).set({ usedAt: new Date() }).where(eq(adminPasswordResetTokens.id, record.id));
  });
  return true;
}
