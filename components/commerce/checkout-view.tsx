"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { formatCRC } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cartTotal } from "@/lib/store";
import { useStore } from "./store-provider";

type Result = { reference: string; trackingUrl: string; sinpeNumber?: string | null; amount: number; paymentPending?: boolean };

export function CheckoutView({ locale }: { locale: Locale }) {
  const es = locale === "es";
  const { cart, clearCart } = useStore();
  const [method, setMethod] = useState<"stripe" | "sinpe">("stripe");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const total = cartTotal(cart);

  if (!cart.length && !result) return <section className="cart-empty"><h2>{es ? "Tu carrito está vacío" : "Your cart is empty"}</h2><Link className="commerce-primary" href="/flores">{es ? "Ver flores" : "Browse flowers"}</Link></section>;
  if (result) return <section className="cart-empty"><span>✓</span><h2>{es ? "Pedido creado" : "Order created"}</h2><p>{es ? `Tu referencia es ${result.reference}.` : `Your reference is ${result.reference}.`}</p>{method === "sinpe" ? <><p>{result.sinpeNumber ? `${es ? "Envía" : "Send"} ${formatCRC(result.amount)} ${es ? "por SINPE Móvil al" : "by SINPE Móvil to"} ${result.sinpeNumber}. ${es ? "Te confirmaremos el pago tras revisarlo." : "We will confirm payment after review."}` : es ? "SINPE Móvil aún no está configurado." : "SINPE Móvil is not configured yet."}</p></> : <p>{es ? "Stripe se conectará al configurar sus credenciales." : "Stripe will connect once its credentials are configured."}</p>}<Link className="commerce-primary" href={result.trackingUrl}>{es ? "Ver seguimiento" : "Track order"}</Link></section>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone: form.get("phone"), fulfillment, deliveryAddress: form.get("deliveryAddress"), paymentMethod: method, items: cart.map(item => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity, personalization: item.personalization })) }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) { setError(data.error || (es ? "No se pudo crear el pedido." : "We could not create the order.")); return; }
    clearCart(); setResult(data);
  }

  return <form className="commerce-form" onSubmit={submit}>
    <label>{es ? "Nombre" : "Name"}<input name="name" required minLength={2}/></label><label>{es ? "Teléfono" : "Phone"}<input name="phone" required minLength={7}/></label><label className="form-wide">{es ? "Correo" : "Email"}<input name="email" type="email"/></label>
    <fieldset className="form-wide"><legend>{es ? "Entrega" : "Fulfillment"}</legend><label><input type="radio" checked={fulfillment === "delivery"} onChange={() => setFulfillment("delivery")}/> {es ? "Entrega a domicilio" : "Delivery"}</label><label><input type="radio" checked={fulfillment === "pickup"} onChange={() => setFulfillment("pickup")}/> {es ? "Retiro" : "Pickup"}</label>{fulfillment === "delivery" && <label>{es ? "Dirección de entrega" : "Delivery address"}<textarea name="deliveryAddress" required/></label>}</fieldset>
    <fieldset className="form-wide"><legend>{es ? "Método de pago" : "Payment method"}</legend><label><input type="radio" checked={method === "stripe"} onChange={() => setMethod("stripe")}/> {es ? "Tarjeta segura con Stripe" : "Secure card payment with Stripe"}</label><label><input type="radio" checked={method === "sinpe"} onChange={() => setMethod("sinpe")}/> {es ? "SINPE Móvil" : "SINPE Móvil"}</label></fieldset>
    <p className="form-wide"><strong>{es ? "Subtotal" : "Subtotal"}: {formatCRC(total)}</strong></p>{error && <p role="alert" className="form-wide">{error}</p>}<button className="commerce-primary form-wide" disabled={loading}>{loading ? (es ? "Procesando…" : "Processing…") : method === "stripe" ? (es ? "Ir a pago seguro" : "Go to secure payment") : (es ? "Crear pedido SINPE" : "Create SINPE order")}</button>
  </form>;
}
