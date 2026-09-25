"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { formatCRC } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cartTotal, checkoutLines } from "@/lib/store";
import { useStore } from "./store-provider";

type Result = { reference: string; trackingToken: string; trackingUrl: string; sinpeNumber?: string | null; amount: number; paymentPending?: boolean };
type Quote = { subtotal: number; deliveryFee: number; total: number; depositPercent: number; deposit: number; balance: number };

export function CheckoutView({ locale }: { locale: Locale }) {
  const es = locale === "es";
  const { cart, clearCart } = useStore();
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofMessage, setProofMessage] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const idempotencyKey = useRef<string>(crypto.randomUUID());
  const total = cartTotal(cart);
  useEffect(() => {
    if (!cart.length) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/checkout/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fulfillment, items: checkoutLines(cart) }), signal: controller.signal });
        if (response.ok) setQuote(await response.json()); else setQuote(null);
      } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setQuote(null); }
    }, 150);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [cart, fulfillment]);

  if (!cart.length && !result) return <section className="cart-empty"><h2>{es ? "Tu carrito está vacío" : "Your cart is empty"}</h2><Link className="commerce-primary" href="/flores">{es ? "Ver flores" : "Browse flowers"}</Link></section>;
  if (result) return <section className="cart-empty"><span>✓</span><h2>{es ? "Pedido creado" : "Order created"}</h2><p>{es ? `Tu referencia es ${result.reference}.` : `Your reference is ${result.reference}.`}</p><p>{result.sinpeNumber ? `${es ? "Envía" : "Send"} ${formatCRC(result.amount)} ${es ? "por SINPE Móvil al" : "by SINPE Móvil to"} ${result.sinpeNumber}.` : es ? "SINPE Móvil aún no está configurado." : "SINPE Móvil is not configured yet."}</p><form className="commerce-form commerce-proof-form" onSubmit={uploadProof}><label>{es ? "Comprobante de pago" : "Payment proof"}<input name="proof" type="file" accept="image/jpeg,image/png,image/webp" required/></label><p>{es ? "Sube una captura clara del comprobante. Revisaremos el pago antes de preparar tu pedido." : "Upload a clear screenshot of the transfer. We will review payment before preparing your order."}</p>{proofMessage && <p role="status">{proofMessage}</p>}<button className="commerce-primary" disabled={proofLoading}>{proofLoading ? (es ? "Subiendo comprobante…" : "Uploading proof…") : (es ? "Enviar comprobante" : "Send proof")}</button></form><Link className="commerce-primary" href={result.trackingUrl}>{es ? "Ver seguimiento" : "Track order"}</Link></section>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const items = checkoutLines(cart);
      const response = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": idempotencyKey.current }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone: form.get("phone"), fulfillment, deliveryAddress: form.get("deliveryAddress"), paymentMethod: "sinpe", items }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error || (es ? "No se pudo crear el pedido." : "We could not create the order.")); return; }
      clearCart(); setResult(data);
    } catch { setError(es ? "No se pudo conectar para crear el pedido." : "We could not connect to create the order."); }
    finally { setLoading(false); }
  }

  async function uploadProof(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!result) return;
    setProofLoading(true); setProofMessage("");
    const form = new FormData(event.currentTarget); form.set("reference", result.reference); form.set("token", result.trackingToken);
    try {
      const response = await fetch("/api/payment-proof", { method: "POST", body: form });
      const data = await response.json();
      setProofMessage(response.ok ? (es ? "Comprobante enviado. Te avisaremos cuando confirmemos el pago." : "Proof sent. We will notify you once payment is confirmed.") : data.error || (es ? "No se pudo subir el comprobante." : "We could not upload the proof."));
    } catch { setProofMessage(es ? "No se pudo conectar para subir el comprobante." : "We could not connect to upload the proof."); }
    finally { setProofLoading(false); }
  }

  return <form className="commerce-form" onSubmit={submit}>
    <label>{es ? "Nombre" : "Name"}<input name="name" required minLength={2}/></label><label>{es ? "Teléfono" : "Phone"}<input name="phone" required minLength={7}/></label><label className="form-wide">{es ? "Correo" : "Email"}<input name="email" type="email"/></label>
    <fieldset className="form-wide"><legend>{es ? "Entrega" : "Fulfillment"}</legend><label><input type="radio" checked={fulfillment === "delivery"} onChange={() => setFulfillment("delivery")}/> {es ? "Entrega a domicilio" : "Delivery"}</label><label><input type="radio" checked={fulfillment === "pickup"} onChange={() => setFulfillment("pickup")}/> {es ? "Retiro" : "Pickup"}</label>{fulfillment === "delivery" && <label>{es ? "Dirección de entrega" : "Delivery address"}<textarea name="deliveryAddress" required/></label>}</fieldset>
    <fieldset className="form-wide"><legend>{es ? "Método de pago" : "Payment method"}</legend><p>SINPE Móvil</p></fieldset>
    <dl className="form-wide checkout-totals"><div><dt>{es ? "Subtotal" : "Subtotal"}</dt><dd>{formatCRC(quote?.subtotal ?? total)}</dd></div><div><dt>{es ? "Entrega" : "Delivery"}</dt><dd>{quote ? formatCRC(quote.deliveryFee) : "—"}</dd></div><div><dt>{es ? "Total" : "Total"}</dt><dd>{quote ? formatCRC(quote.total) : "—"}</dd></div><div><dt>{es ? `Adelanto requerido (${quote?.depositPercent ?? "—"}%)` : `Required deposit (${quote?.depositPercent ?? "—"}%)`}</dt><dd>{quote ? formatCRC(quote.deposit) : "—"}</dd></div><div><dt>{es ? "Saldo pendiente" : "Remaining balance"}</dt><dd>{quote ? formatCRC(quote.balance) : "—"}</dd></div></dl>{error && <p role="alert" className="form-wide">{error}</p>}<button className="commerce-primary form-wide" disabled={loading || !quote}>{loading ? (es ? "Procesando…" : "Processing…") : (es ? "Crear pedido SINPE" : "Create SINPE order")}</button>
  </form>;
}
