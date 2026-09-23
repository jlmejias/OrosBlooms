import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "oros_admin_session";
const maxAge = 60 * 60 * 8;
function secret() { const value = process.env.ADMIN_SESSION_SECRET; if (value) return value; if (process.env.NODE_ENV !== "production") return "orosblooms-local-development-secret-change-me"; throw new Error("ADMIN_SESSION_SECRET es obligatorio en producción"); }
function sign(payload: string) { return createHmac("sha256", secret()).update(payload).digest("base64url"); }
function safeEqual(a: string, b: string) { const left = Buffer.from(a); const right = Buffer.from(b); return left.length === right.length && timingSafeEqual(left, right); }

export async function createAdminSession(email: string) { const payload = Buffer.from(JSON.stringify({ email, role: "admin", exp: Date.now() + maxAge * 1000 })).toString("base64url"); (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge }); }
export async function getAdminSession() { const token = (await cookies()).get(COOKIE)?.value; if (!token) return null; const [payload, signature] = token.split("."); if (!payload || !signature || !safeEqual(signature, sign(payload))) return null; try { const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { email: string; role: string; exp: number }; return data.role === "admin" && data.exp > Date.now() ? data : null; } catch { return null; } }
export async function requireAdmin() { const session = await getAdminSession(); if (!session) redirect("/acceso-admin"); return session; }
export async function clearAdminSession() { (await cookies()).delete(COOKIE); }
export function validAdminCredentials(email: string, password: string) { const expectedEmail = process.env.ADMIN_EMAIL ?? (process.env.NODE_ENV !== "production" ? "admin@orosblooms.local" : ""); const expectedPassword = process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV !== "production" ? "OrosBlooms2026!" : ""); return Boolean(expectedEmail && expectedPassword) && safeEqual(email.toLowerCase(), expectedEmail.toLowerCase()) && safeEqual(password, expectedPassword); }
