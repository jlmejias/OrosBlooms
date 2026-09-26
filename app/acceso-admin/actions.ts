"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSession, validAdminCredentials } from "@/lib/admin-auth";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (process.env.NODE_ENV !== "development") {
    const requestHeaders = await headers();
    const rate = await consumeRateLimit("admin-login", `${clientIp(requestHeaders)}:${email.toLowerCase()}`, { limit: 5, windowSeconds: 900 });
    if (!rate.allowed) redirect("/acceso-admin?error=rate");
  }
  if (!await validAdminCredentials(email, password)) redirect("/acceso-admin?error=1");
  await createAdminSession(email);
  redirect("/admin");
}
