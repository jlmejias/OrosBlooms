"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSession, validAdminCredentials } from "@/lib/admin-auth";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (process.env.NODE_ENV !== "development") {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    if (!process.env.ADMIN_PASSWORD_HASH || !sessionSecret || sessionSecret.length < 32) {
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
