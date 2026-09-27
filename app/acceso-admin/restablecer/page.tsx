import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { completeAdminPasswordReset } from "../actions";
import { AdminPasswordResetForm } from "../../../components/admin/admin-password-reset-form";
import "../../admin/admin.css";

export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false, follow: false, nocache: true } };

export default async function ResetAdminPassword({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token = "", error } = await searchParams;
  const message = error === "length" ? "La contraseña debe tener al menos 8 caracteres." : error === "match" ? "Las contraseñas no coinciden." : error === "expired" ? "Este enlace venció o ya fue utilizado. Solicita uno nuevo." : "";
  if (!token) return <main className="admin-login"><section className="admin-login-card admin-recovery-card"><div className="admin-login-heading"><h1>Enlace inválido</h1><p>Solicita un nuevo enlace de recuperación.</p></div><Link className="admin-login-back" href="/acceso-admin/recuperar">Recuperar acceso</Link></section></main>;
  return <main className="admin-login"><section className="admin-login-card admin-recovery-card admin-reset-card"><span className="admin-reset-botanical" aria-hidden="true" /><header className="admin-login-brand"><Image src="/orosblooms-logo.png" alt="OrosBlooms" width={190} height={60} priority/><p>Panel administrativo</p></header><div className="admin-login-heading"><h1>Crear nueva<br />contraseña</h1><p>Elige una contraseña segura para acceder<br />al panel administrativo.</p></div>{message&&<p role="alert" className="admin-login-error admin-login-message">{message}</p>}<AdminPasswordResetForm action={completeAdminPasswordReset} token={token} /></section></main>;
}
