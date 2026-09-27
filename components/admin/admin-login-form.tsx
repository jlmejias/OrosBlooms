"use client";

import { ArrowRightOutlined, EyeInvisibleOutlined, EyeOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";

type Props = { action: (formData: FormData) => void | Promise<void> };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="admin-login-submit" type="submit" disabled={pending}>{pending ? "Ingresando…" : <>Ingresar <ArrowRightOutlined /></>}</button>;
}

export function AdminLoginForm({ action }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return <form action={action} className="admin-login-form">
    <label>
      <span>Usuario</span>
      <span className="admin-login-input"><UserOutlined aria-hidden="true" /><input name="username" type="text" autoComplete="username" placeholder="OrosBlooms" required /></span>
    </label>
    <label>
      <span>Contraseña</span>
      <span className="admin-login-input"><LockOutlined aria-hidden="true" /><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required /><button type="button" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}</button></span>
    </label>
    <div className="admin-login-form-options"><label className="admin-login-toggle"><input type="checkbox" checked={showPassword} onChange={event => setShowPassword(event.target.checked)} /> <span>Mostrar contraseña</span></label><Link href="/acceso-admin/recuperar">¿Olvidaste tu contraseña?</Link></div>
    <SubmitButton />
  </form>;
}
