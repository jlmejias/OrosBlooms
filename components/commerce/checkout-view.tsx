"use client";

import Link from "next/link";
import Image from "next/image";
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
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [giftNote, setGiftNote] = useState("");
  const idempotencyKey = useRef<string>(crypto.randomUUID());
  const total = cartTotal(cart);
  useEffect(() => () => { if (proofPreview) URL.revokeObjectURL(proofPreview); }, [proofPreview]);
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
  if (result) return <section className="checkout-confirmation"><p className="checkout-breadcrumb">{es ? "Carrito  ›  Pago y entrega  ›  Confirmación" : "Cart  ›  Payment and delivery  ›  Confirmation"}</p><header className="checkout-confirmation-heading"><span aria-hidden="true">✓</span><div><h1>{es ? "¡Tu pedido fue creado!" : "Your order was created!"}</h1><p>{es ? "Tu referencia es" : "Your reference is"} <strong>{result.reference}</strong></p><small>{es ? "Guarda esta referencia para consultar tu pedido." : "Save this reference to check your order."}</small></div></header><div className="checkout-confirmation-grid"><section className="checkout-confirmation-card"><header><b>1</b><div><h2>{es ? "Realiza tu pago" : "Make your payment"}</h2><p>{es ? "Envía el monto de tu pedido por SINPE Móvil." : "Send your payment through SINPE Móvil."}</p></div></header><div className="checkout-sinpe-card"><div className="checkout-sinpe-brand"><span>SINPE</span><div><strong>SINPE Móvil</strong><small>{es ? "Realiza el pago desde tu banco móvil." : "Pay from your mobile banking app."}</small></div></div><dl><div><dt>{es ? "Monto a enviar" : "Amount to send"}</dt><dd>{formatCRC(result.amount)}</dd></div><div><dt>{es ? "Número SINPE" : "SINPE number"}</dt><dd>{result.sinpeNumber}</dd></div><div><dt>{es ? "Concepto del pago" : "Payment reference"}</dt><dd>{result.reference}</dd></div></dl><p>ⓘ {es ? "Usa la referencia como detalle del pago para que podamos identificar tu pedido." : "Use the reference in your payment so we can identify your order."}</p></div></section><section className="checkout-confirmation-card"><header><b>2</b><div><h2>{es ? "Sube tu comprobante" : "Upload your proof"}</h2><p>{es ? "Una vez realizado el pago, sube una captura clara del comprobante." : "Once payment is complete, upload a clear screenshot of the proof."}</p></div></header><form className="checkout-proof-form" onSubmit={uploadProof}><label className={`checkout-proof-dropzone${proofPreview ? " is-ready" : ""}`}>{proofPreview ? <Image src={proofPreview} alt={es ? "Vista previa del comprobante" : "Payment proof preview"} fill unoptimized/> : <><span aria-hidden="true">⌑</span><strong>{es ? "Arrastra tu comprobante aquí" : "Drop your proof here"}</strong><span>{es ? "o haz clic para seleccionarlo" : "or click to choose it"}</span><small>JPG, PNG o WebP (máx. 5 MB)</small></>}<input name="proof" type="file" accept="image/jpeg,image/png,image/webp" required onChange={event=>{const file=event.currentTarget.files?.[0]??null;setProofFile(file);setProofPreview(current=>{if(current)URL.revokeObjectURL(current);return file?URL.createObjectURL(file):"";});}}/></label>{proofFile&&<p className="checkout-proof-caption">{proofFile.name} · {Math.ceil(proofFile.size/1024)} KB</p>}{proofMessage&&<p role="status" className="checkout-proof-message">{proofMessage}</p>}<button className="commerce-primary" disabled={proofLoading}>{proofLoading ? (es ? "Subiendo comprobante…" : "Uploading proof…") : (es ? "Enviar comprobante" : "Send proof")}</button></form></section></div><footer className="checkout-confirmation-footer"><div><strong>{es ? "¿Qué sigue?" : "What happens next?"}</strong><p>{es ? "Revisaremos tu comprobante antes de comenzar a preparar tu pedido." : "We will review your proof before preparing your order."}</p></div><Link href={result.trackingUrl}>{es ? "Ver seguimiento del pedido →" : "Track your order →"}</Link></footer><Link className="checkout-continue-shopping" href="/flores">{es ? "Seguir comprando  →" : "Continue shopping  →"}</Link></section>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const items = checkoutLines(cart).map(item => giftNote.trim() ? { ...item, personalization: [item.personalization, giftNote.trim()].filter(Boolean).join(" · ").slice(0, 500) } : item);
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

  return <form className="checkout-layout" onSubmit={submit}>
    <div className="checkout-main">
      <section className="checkout-card"><header><span className="checkout-icon" aria-hidden="true">♙</span><div><h2>{es ? "Información de contacto" : "Contact information"}</h2><p>{es ? "Te mantendremos informado sobre tu pedido." : "We will keep you updated about your order."}</p></div></header><div className="checkout-contact-grid"><label>{es ? "Nombre completo" : "Full name"}<input name="name" placeholder={es ? "Tu nombre completo" : "Your full name"} required minLength={2}/></label><label>{es ? "Teléfono" : "Phone"}<input name="phone" placeholder="+506 6123 4567" required minLength={7}/></label><label className="checkout-field-wide">{es ? "Correo electrónico" : "Email address"}<input name="email" type="email" placeholder="tu@email.com"/></label></div></section>
      <section className="checkout-card"><header><span className="checkout-icon" aria-hidden="true">♧</span><div><h2>{es ? "Entrega" : "Delivery"}</h2><p>{es ? "Selecciona cómo quieres recibir tu pedido." : "Choose how you would like to receive your order."}</p></div></header><div className="checkout-delivery-options"><label className={`checkout-delivery-option${fulfillment === "pickup" ? " is-selected" : ""}`}><input type="radio" checked={fulfillment === "pickup"} onChange={() => setFulfillment("pickup")}/><span aria-hidden="true">⌂</span><strong>{es ? "Retiro en tienda" : "Store pickup"}</strong><small>{es ? "Pasa a recoger tu pedido en nuestro local." : "Pick up your order at our store."}</small></label><label className={`checkout-delivery-option${fulfillment === "delivery" ? " is-selected" : ""}`}><input type="radio" checked={fulfillment === "delivery"} onChange={() => setFulfillment("delivery")}/><span aria-hidden="true">⌂</span><strong>{es ? "Entrega a domicilio" : "Home delivery"}</strong><small>{es ? "Recibe tu pedido en la dirección que indiques." : "Receive your order at the address you provide."}</small></label></div>{fulfillment === "delivery" ? <label className="checkout-address">{es ? "Dirección de entrega" : "Delivery address"}<textarea name="deliveryAddress" placeholder={es ? "Indica la dirección donde deseas recibir tu pedido" : "Enter the delivery address"} required/></label> : <p className="checkout-notice">{es ? "Te avisaremos cuando tu pedido esté listo para ser retirado." : "We will let you know when your order is ready for pickup."}</p>}</section>
      <section className="checkout-card"><header><span className="checkout-icon" aria-hidden="true">▣</span><div><h2>{es ? "Método de pago" : "Payment method"}</h2><p>{es ? "Selecciona tu método de pago preferido." : "Select your preferred payment method."}</p></div></header><div className="checkout-payment-option"><span className="checkout-payment-mark">SINPE</span><div><strong>SINPE Móvil</strong><small>{es ? "Pagarás desde tu banca móvil." : "You will pay from your mobile banking app."}</small></div></div></section>
      {error && <p role="alert" className="checkout-error">{error}</p>}<button className="commerce-primary checkout-submit" disabled={loading || !quote}>{loading ? (es ? "Procesando…" : "Processing…") : (es ? "Crear pedido SINPE" : "Create SINPE order")} <span aria-hidden="true">→</span></button><p className="checkout-security">⌑ {es ? "Tu información está protegida y segura." : "Your information is protected and secure."}</p>
    </div>
    <aside className="checkout-sidebar"><section className="checkout-card checkout-order-summary"><header><span className="checkout-icon" aria-hidden="true">⌑</span><div><h2>{es ? "Resumen del pedido" : "Order summary"}</h2></div><Link href="/carrito">{es ? "Volver al carrito" : "Back to cart"}</Link></header><div className="checkout-order-items">{cart.map((item,index)=><article key={`${item.slug}-${index}`}><Image src={item.image ?? "/home-hero.webp"} alt={item.name} width={82} height={82}/><div><strong>{item.name}</strong><small>{item.kind === "combo" ? (es ? "Combo" : "Gift set") : (es ? "Selección floral" : "Floral selection")}</small><em>{es ? `Cant. ${item.quantity}` : `Qty. ${item.quantity}`}</em></div><b>{formatCRC(item.price * item.quantity)}</b></article>)}</div><dl className="checkout-summary-totals"><div><dt>{es ? "Subtotal" : "Subtotal"}</dt><dd>{formatCRC(quote?.subtotal ?? total)}</dd></div><div><dt>{es ? "Entrega" : "Delivery"}</dt><dd>{quote ? formatCRC(quote.deliveryFee) : "—"}</dd></div><div className="checkout-summary-total"><dt>{es ? "Total" : "Total"}</dt><dd>{quote ? formatCRC(quote.total) : "—"}</dd></div>{quote && quote.deposit < quote.total && <div><dt>{es ? `Pago SINPE (${quote.depositPercent}%)` : `SINPE payment (${quote.depositPercent}%)`}</dt><dd>{formatCRC(quote.deposit)}</dd></div>}</dl></section><section className="checkout-card checkout-gift-note"><header><span className="checkout-icon" aria-hidden="true">♢</span><div><h2>{es ? "¿Es un regalo?" : "Is it a gift?"}</h2><p>{es ? "Agrega una dedicatoria para acompañar tu pedido." : "Add a note to accompany your order."}</p></div></header><textarea value={giftNote} maxLength={500} placeholder={es ? "Escribe tu mensaje aquí (opcional)" : "Write your message here (optional)"} onChange={event => setGiftNote(event.target.value)}/><small>{giftNote.length}/500</small></section></aside>
  </form>;
}
