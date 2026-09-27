"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[admin] No se pudo cargar la sección", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <main className="admin-render-error">
      <section className="admin-render-error-card" role="alert">
        <span className="admin-render-error-mark">!</span>
        <p className="admin-render-error-eyebrow">OrosBlooms · Administración</p>
        <h1>No pudimos cargar esta sección</h1>
        <p>
          Ocurrió un problema temporal al cargar el panel. Intenta nuevamente
          o vuelve al resumen de administración.
        </p>
        <div className="admin-render-error-actions">
          <button type="button" onClick={retry}>
            Reintentar
          </button>
          <Link href="/admin">Volver al resumen</Link>
        </div>
      </section>
    </main>
  );
}
