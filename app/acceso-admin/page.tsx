import type { Metadata } from "next";
import { loginAdmin } from "./actions";
import { ValidatedAdminForm } from "@/components/admin/validated-admin-form";
import "../admin/admin.css";
export const metadata:Metadata={title:"Acceso administrativo",robots:{index:false,follow:false,nocache:true}};
export default async function AdminLogin({searchParams}:{searchParams:Promise<{error?:string}>}){const{error}=await searchParams;return <main className="admin-login"><div className="admin-login-card"><p className="commerce-kicker">OrosBlooms</p><h1>Administración</h1><p>Acceso exclusivo para el equipo.</p>{error&&<p role="alert" className="admin-error">{error==="rate"?"Demasiados intentos. Espera 15 minutos antes de volver a intentar.":"Correo o contraseña incorrectos."}</p>}<ValidatedAdminForm action={loginAdmin} required={["email","password"]} email={["email"]} submitLabel="Ingresar"><label>Correo<input name="email" type="email" autoComplete="username"/></label><label>Contraseña<input name="password" type="password" autoComplete="current-password"/></label></ValidatedAdminForm></div></main>}
