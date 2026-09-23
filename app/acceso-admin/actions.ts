"use server";
import { redirect } from "next/navigation"; import { createAdminSession, validAdminCredentials } from "@/lib/admin-auth";
export async function loginAdmin(formData:FormData){const email=String(formData.get("email")??"").trim();const password=String(formData.get("password")??"");if(!validAdminCredentials(email,password))redirect("/acceso-admin?error=1");await createAdminSession(email);redirect("/admin")}
