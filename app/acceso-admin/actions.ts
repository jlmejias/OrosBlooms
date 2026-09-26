"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSession, validAdminCredentials } from "@/lib/admin-auth";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (process.env.NODE_ENV !== "development") {
    const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
    const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
    if (!passwordHash || !sessionSecret || sessionSecret.length < 32) {
      console.error("[admin] invalid production configuration", {
        hasPasswordHash: Boolean(passwordHash),
        passwordHashFormat: passwordHash?.startsWith("scrypt$") ?? false,
        sessionSecretLength: sessionSecret?.length ?? 0,
      });
      redirect("/acceso-admin?error=config");
    }
    const requestHeaders = await headers();
    const rate = await consumeRateLimit("admin-login", `${clientIp(requestHeaders)}:${username.toLowerCase()}`, { limit: 5, windowSeconds: 900 });
    if (!rate.allowed) redirect("/acceso-admin?error=rate");
  }
  if (!await validAdminCredentials(username, password)) redirect("/acceso-admin?error=1");
  await createAdminSession(username);
  redirect("/admin");
}
