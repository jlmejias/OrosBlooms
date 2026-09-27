import type { Metadata } from "next";
import Image from "next/image";
import { loginAdmin } from "./actions";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import "../admin/admin.css";

export const metadata: Metadata = { title: "Acceso administrativo", robots: { index: false, follow: false, nocache: true } };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const { error, reset } = await searchParams;
  const errorMessage = error === "rate" ? "Demasiados intentos. Espera 15 minutos antes de volver a intentar." : error === "config" ? "El acceso administrativo aún no está configurado en producción." : error ? "Usuario o contraseña incorrectos." : "";
  const resetMessage = reset === "1" ? "Contraseña actualizada. Ya puedes ingresar." : "";

  return <main className="admin-login"><section className="admin-login-card"><header className="admin-login-brand"><Image src="/orosblooms-logo.png" alt="OrosBlooms" width={190} height={60} priority/><p>Panel administrativo</p></header><div className="admin-login-heading"><h1>Administración</h1><p>Acceso exclusivo para el equipo.</p></div>{errorMessage&&<div role="alert" className="admin-login-error"><strong>{errorMessage}</strong>{error === "config"&&<span>Contacta al responsable del sitio para habilitarlo.</span>}</div>}{resetMessage&&<p className="admin-login-success" role="status">{resetMessage}</p>}<AdminLoginForm action={loginAdmin}/></section></main>;
}
