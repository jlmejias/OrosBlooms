import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requestAdminPasswordReset } from "../actions";
import "../../admin/admin.css";

export const metadata: Metadata = { title: "Recuperar acceso", robots: { index: false, follow: false, nocache: true } };

export default async function RecoverAdminAccess({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  const message = sent === "1" ? "Si existe una cuenta para ese correo, recibirás un enlace para crear una nueva contraseña." : error === "rate" ? "Demasiados intentos. Espera 15 minutos antes de volver a intentarlo." : error === "delivery" ? "No se pudo enviar el correo en este momento. Inténtalo nuevamente." : error === "config" ? "La recuperación por correo todavía no está configurada." : error ? "Ingresa un correo válido." : "";
  return <main className="admin-login"><section className="admin-login-card admin-recovery-card"><header className="admin-login-brand"><Image src="/orosblooms-logo.png" alt="OrosBlooms" width={190} height={60} priority/><p>Panel administrativo</p></header><div className="admin-login-heading"><h1>Recuperar acceso</h1><p>Te enviaremos un enlace seguro para crear una nueva contraseña.</p></div>{message&&<p role="status" className={sent === "1" ? "admin-login-success" : "admin-login-error admin-login-message"}>{message}</p>}<form action={requestAdminPasswordReset} className="admin-login-form"><label><span>Correo de recuperación</span><span className="admin-login-input"><input name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required /></span></label><button className="admin-login-submit" type="submit">Enviar enlace <span aria-hidden="true">→</span></button></form><Link className="admin-login-back" href="/acceso-admin">Volver a iniciar sesión</Link></section></main>;
}
