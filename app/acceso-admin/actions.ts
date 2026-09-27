"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSession, provisionInitialAdmin, validAdminCredentials } from "@/lib/admin-auth";
import { createAdminPasswordReset, resetAdminPassword } from "@/lib/admin-password-recovery";
import { sendAdminPasswordResetEmail } from "@/lib/email";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (process.env.NODE_ENV !== "development") {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
    if (!sessionSecret || sessionSecret.length < 32) {
      console.error("[admin] invalid production configuration", {
        sessionSecretLength: sessionSecret?.length ?? 0,
      });
      redirect("/acceso-admin?error=config");
    }
    const requestHeaders = await headers();
    const rate = await consumeRateLimit("admin-login", `${clientIp(requestHeaders)}:${username.toLowerCase()}`, { limit: 5, windowSeconds: 900 });
    if (!rate.allowed) redirect("/acceso-admin?error=rate");
  }
  let credentialsValid = false;
  try {
    credentialsValid = await validAdminCredentials(username, password);
  } catch (error) {
    console.error("[admin] login database error", error);
    redirect("/acceso-admin?error=config");
  }
  if (!credentialsValid) redirect("/acceso-admin?error=1");
  if (process.env.NODE_ENV !== "development") {
    try {
      await provisionInitialAdmin();
    } catch (error) {
      console.error("[admin] account provisioning error", error);
      redirect("/acceso-admin?error=config");
    }
  }
  await createAdminSession(username);
  redirect("/admin");
}

export async function requestAdminPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const returnPath = "/acceso-admin/recuperar";
  if (!email) redirect(`${returnPath}?error=invalid`);
  const requestHeaders = await headers();
  const rate = await consumeRateLimit("admin-password-reset", `${clientIp(requestHeaders)}:${email}`, { limit: 3, windowSeconds: 900 });
  if (!rate.allowed) redirect(`${returnPath}?error=rate`);
  const reset = await createAdminPasswordReset(email);
  if (reset) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    if (!baseUrl) redirect(`${returnPath}?error=config`);
    const result = await sendAdminPasswordResetEmail(reset.email, `${baseUrl}/acceso-admin/restablecer?token=${encodeURIComponent(reset.token)}`);
    if (!result.sent) redirect(`${returnPath}?error=delivery`);
  }
  redirect(`${returnPath}?sent=1`);
}

export async function completeAdminPasswordReset(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const returnPath = `/acceso-admin/restablecer?token=${encodeURIComponent(token)}`;
  if (password.length < 8) redirect(`${returnPath}&error=length`);
  if (password !== confirmPassword) redirect(`${returnPath}&error=match`);
  if (!await resetAdminPassword(token, password)) redirect(`${returnPath}&error=expired`);
  redirect("/acceso-admin?reset=1");
}
