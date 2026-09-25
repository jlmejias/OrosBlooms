import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/password";
import { createAdminSessionToken, verifyAdminSessionToken } from "@/lib/admin-session";

const COOKIE = "oros_admin_session";
const maxAge = 60 * 60 * 8;
const explicitLocalFallback = () => process.env.NODE_ENV === "development" && process.env.ALLOW_INSECURE_LOCAL_ADMIN === "true";
function secret() { const value = process.env.ADMIN_SESSION_SECRET; if (value && value.length >= 32) return value; if (explicitLocalFallback()) return "orosblooms-explicit-local-development-secret-change-me"; throw new Error("ADMIN_SESSION_SECRET debe tener al menos 32 caracteres"); }
function safeEqual(a: string, b: string) { const left = Buffer.from(a); const right = Buffer.from(b); return left.length === right.length && timingSafeEqual(left, right); }

export async function createAdminSession(email: string) { const token=createAdminSessionToken(email,secret(),Date.now()+maxAge*1000);(await cookies()).set(COOKIE,token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge}); }
export async function getAdminSession() { const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;return verifyAdminSessionToken(token,secret()); }
export async function requireAdmin() { const session = await getAdminSession(); if (!session) redirect("/acceso-admin"); return session; }
export async function clearAdminSession() { (await cookies()).delete(COOKIE); }
export async function validAdminCredentials(email: string, password: string) { const expectedEmail = process.env.ADMIN_EMAIL ?? (explicitLocalFallback() ? "admin@orosblooms.local" : ""); const passwordHash = process.env.ADMIN_PASSWORD_HASH; if (!expectedEmail || !safeEqual(email.toLowerCase(), expectedEmail.toLowerCase())) return false; if (passwordHash) return verifyPassword(password, passwordHash); return explicitLocalFallback() && safeEqual(password, "OrosBlooms2026!"); }
