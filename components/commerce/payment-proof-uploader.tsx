"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

type PaymentProofUploaderProps = {
  reference: string;
  token: string;
  locale: Locale;
};

export function PaymentProofUploader({ reference, token, locale }: PaymentProofUploaderProps) {
  const es = locale === "es";
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/payment-proof", { method: "POST", body: new FormData(event.currentTarget) });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSubmitted(true);
        setMessage(es ? "Comprobante enviado. Te avisaremos cuando confirmemos el pago." : "Proof sent. We will notify you once payment is confirmed.");
      } else setMessage(data.error || (es ? "No se pudo subir el comprobante." : "We could not upload the proof."));
    } catch {
      setMessage(es ? "No se pudo conectar para subir el comprobante." : "We could not connect to upload the proof.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) return <section role="status" className="payment-proof-submitted"><span aria-hidden="true">✓</span><div><strong>{es ? "Comprobante enviado" : "Proof submitted"}</strong><p>{message}</p></div></section>;

  return <form className="checkout-proof-form" onSubmit={submit}>
    <input type="hidden" name="reference" value={reference}/>
    <input type="hidden" name="token" value={token}/>
    <label className={`checkout-proof-dropzone${preview ? " is-ready" : ""}`}>
      {preview ? <Image src={preview} alt={es ? "Vista previa del comprobante" : "Payment proof preview"} fill unoptimized/> : <><span aria-hidden="true">⌑</span><strong>{es ? "Arrastra tu comprobante aquí" : "Drop your proof here"}</strong><span>{es ? "o haz clic para seleccionarlo" : "or click to choose it"}</span><small>JPG, PNG o WebP (máx. 5 MB)</small></>}
      <input name="proof" type="file" accept="image/jpeg,image/png,image/webp" required onChange={event => {
        const selected = event.currentTarget.files?.[0] ?? null;
        setFile(selected);
        setPreview(current => {
          if (current) URL.revokeObjectURL(current);
          return selected ? URL.createObjectURL(selected) : "";
        });
      }}/>
    </label>
    {file && <p className="checkout-proof-caption">{file.name} · {Math.ceil(file.size / 1024)} KB</p>}
    {message && <p role="status" className="checkout-proof-message">{message}</p>}
    <button className="commerce-primary" disabled={loading || !file}>{loading ? (es ? "Subiendo comprobante…" : "Uploading proof…") : (es ? "Enviar comprobante" : "Send proof")}</button>
  </form>;
}
