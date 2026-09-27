"use client";

import { ArrowRightOutlined, CheckCircleFilled, EyeInvisibleOutlined, EyeOutlined, LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  token: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="admin-login-submit" type="submit" disabled={pending}>{pending ? "Guardando…" : <>Guardar contraseña <ArrowRightOutlined /></>}</button>;
}

export function AdminPasswordResetForm({ action, token }: Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const checks = useMemo(() => [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Incluye una mayúscula", valid: /[A-ZÁÉÍÓÚÑ]/.test(password) },
    { label: "Incluye un número", valid: /\d/.test(password) },
  ], [password]);
  const score = checks.filter(check => check.valid).length;
  const strength = score === 3 ? "Segura" : score === 2 ? "Aceptable" : score === 1 ? "Débil" : "";

  return <form action={action} className="admin-login-form admin-reset-form">
    <input type="hidden" name="token" value={token} />
    <label>
      <span>Nueva contraseña</span>
      <span className="admin-login-input"><LockOutlined aria-hidden="true" /><input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}</button></span>
    </label>
    <div className="admin-password-strength" aria-live="polite">
      <div className="admin-password-strength-bar" aria-label={strength ? `Seguridad: ${strength}` : "Seguridad de la contraseña"}><span style={{ width: `${(score / checks.length) * 100}%` }} /></div>
      <strong>{strength}</strong>
    </div>
    <ul className="admin-password-checks">
      {checks.map(check => <li className={check.valid ? "is-valid" : ""} key={check.label}><CheckCircleFilled aria-hidden="true" /> {check.label}</li>)}
    </ul>
    <label>
      <span>Confirmar contraseña</span>
      <span className="admin-login-input"><LockOutlined aria-hidden="true" /><input name="confirmPassword" type={showConfirmation ? "text" : "password"} autoComplete="new-password" minLength={8} required /><button type="button" aria-label={showConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowConfirmation(value => !value)}>{showConfirmation ? <EyeInvisibleOutlined /> : <EyeOutlined />}</button></span>
    </label>
    <SubmitButton />
    <Link className="admin-login-back admin-reset-back" href="/acceso-admin">Volver al acceso</Link>
  </form>;
}
