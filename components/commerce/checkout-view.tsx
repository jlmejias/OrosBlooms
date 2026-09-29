"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { formatCRC } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cartTotal, checkoutLines } from "@/lib/store";
import { CheckoutPaymentConfirmation } from "./checkout-payment-confirmation";
import { useStore } from "./store-provider";

type Result = {
  reference: string;
  trackingToken: string;
  trackingUrl: string;
  zelleRecipient?: string | null;
  amount: number;
  total: number;
  balance: number;
};
type Quote = { subtotal: number; deliveryFee: number; total: number; depositPercent: number; deposit: number; balance: number };
type CopyKey = "amount" | "recipient" | "reference";

export function CheckoutView({ locale }: { locale: Locale }) {
  const es = locale === "es";
  const { cart, clearCart } = useStore();
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [paymentOption, setPaymentOption] = useState<"deposit" | "full">("deposit");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofMessage, setProofMessage] = useState("");
  const [proofUploaded, setProofUploaded] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [giftNote, setGiftNote] = useState("");
  const [paymentConfirmationOpen, setPaymentConfirmationOpen] = useState(false);
  const [copiedValue, setCopiedValue] = useState<CopyKey | null>(null);
  const checkoutForm = useRef<HTMLFormElement>(null);
  const idempotencyKey = useRef<string>(crypto.randomUUID());
  const total = cartTotal(cart);
  const paymentQuote = quote
    ? paymentOption === "full"
      ? { ...quote, depositPercent: 100, deposit: quote.total, balance: 0 }
      : quote
    : null;

  async function copyPaymentValue(value: string, field: CopyKey) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(field);
      window.setTimeout(() => setCopiedValue(current => current === field ? null : current), 1_600);
    } catch {
      setCopiedValue(null);
    }
  }

  useEffect(() => () => { if (proofPreview) URL.revokeObjectURL(proofPreview); }, [proofPreview]);
  useEffect(() => {
    if (!cart.length) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/checkout/quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ fulfillment, items: checkoutLines(cart) }),
          signal: controller.signal,
        });
        if (response.ok) setQuote(await response.json()); else setQuote(null);
      } catch (requestError) {
        if (!(requestError instanceof DOMException && requestError.name === "AbortError")) setQuote(null);
      }
    }, 150);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [cart, fulfillment]);

  async function createOrder() {
    if (!checkoutForm.current || !paymentQuote) return;
    setError("");
    setLoading(true);
    const form = new FormData(checkoutForm.current);
    const deliveryAddress = form.get("deliveryAddress");
    try {
      const items = checkoutLines(cart).map(item => giftNote.trim()
        ? { ...item, personalization: [item.personalization, giftNote.trim()].filter(Boolean).join(" · ").slice(0, 500) }
        : item,
      );
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": idempotencyKey.current },
        body: JSON.stringify({
          name: form.get("name"), email: form.get("email"), phone: form.get("phone"), fulfillment,
          deliveryAddress: typeof deliveryAddress === "string" ? deliveryAddress : undefined, paymentMethod: "zelle", paymentOption, items,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || (es ? "No se pudo crear el pedido." : "We could not create the order."));
        return;
      }
      clearCart();
      setPaymentConfirmationOpen(false);
      setProofUploaded(false);
      setResult(data);
    } catch {
      setError(es ? "No se pudo conectar para crear el pedido." : "We could not connect to create the order.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadProof(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!result) return;
    setProofLoading(true);
    setProofMessage("");
    setProofUploaded(false);
    const form = new FormData(event.currentTarget);
    form.set("reference", result.reference);
    form.set("token", result.trackingToken);
    try {
      const response = await fetch("/api/payment-proof", { method: "POST", body: form });
      const data = await response.json();
      setProofUploaded(response.ok);
      setProofMessage(response.ok
        ? (es ? "Comprobante enviado. Te avisaremos cuando confirmemos el pago." : "Proof sent. We will notify you once payment is confirmed.")
        : data.error || (es ? "No se pudo subir el comprobante." : "We could not upload the proof."),
      );
    } catch {
      setProofMessage(es ? "No se pudo conectar para subir el comprobante." : "We could not connect to upload the proof.");
    } finally {
      setProofLoading(false);
    }
  }

  if (!cart.length && !result) return <section className="cart-empty"><h2>{es ? "Tu carrito está vacío" : "Your cart is empty"}</h2><Link className="commerce-primary" href="/flores">{es ? "Ver flores" : "Browse flowers"}</Link></section>;

  if (result) {
    const isDeposit = result.balance > 0;
    return <section className="checkout-confirmation">
      <p className="checkout-breadcrumb">{es ? "Carrito  ›  Pago y entrega  ›  Confirmación" : "Cart  ›  Payment and delivery  ›  Confirmation"}</p>
      <header className="checkout-confirmation-heading"><span aria-hidden="true">✓</span><div><h1>{es ? "¡Tu pedido fue creado!" : "Your order was created!"}</h1><p>{es ? "Tu referencia es" : "Your reference is"} <strong>{result.reference}</strong></p><small>{es ? "Guarda esta referencia para consultar tu pedido." : "Save this reference to check your order."}</small></div></header>
      <div className="checkout-confirmation-grid">
        <section className="checkout-confirmation-card">
          <header><b>1</b><div><h2>{es ? "Realiza tu pago" : "Make your payment"}</h2><p>{isDeposit ? (es ? "Envía el adelanto indicado por Zelle. El saldo se coordinará contigo." : "Send the required deposit through Zelle. We will coordinate the remaining balance with you.") : (es ? "Envía el total indicado por Zelle." : "Send the full amount through Zelle.")}</p></div></header>
          <div className="checkout-zelle-card">
            <div className="checkout-zelle-brand"><span>Zelle</span><div><strong>Zelle</strong><small>{es ? "Envía el pago a través de Zelle." : "Send your payment through Zelle."}</small></div></div>
            <div className="checkout-zelle-payment-details">
              <div className="checkout-zelle-due"><div><span>{es ? "Pago requerido hoy" : "Payment due today"}</span><strong>{formatCRC(result.amount)}</strong></div><button type="button" onClick={() => copyPaymentValue(formatCRC(result.amount), "amount")}>{copiedValue === "amount" ? (es ? "Copiado ✓" : "Copied ✓") : (es ? "Copiar" : "Copy")}</button></div>
              <dl className="checkout-zelle-details">
                <div><dt>{es ? "Destinatario Zelle" : "Zelle recipient"}</dt><dd>{result.zelleRecipient ? <><span>{result.zelleRecipient}</span><button type="button" onClick={() => copyPaymentValue(result.zelleRecipient!, "recipient")}>{copiedValue === "recipient" ? (es ? "Copiado ✓" : "Copied ✓") : (es ? "Copiar" : "Copy")}</button></> : "—"}</dd></div>
                <div><dt>{es ? "Referencia del pedido" : "Order reference"}</dt><dd><span>{result.reference}</span><button type="button" onClick={() => copyPaymentValue(result.reference, "reference")}>{copiedValue === "reference" ? (es ? "Copiado ✓" : "Copied ✓") : (es ? "Copiar" : "Copy")}</button></dd></div>
                <div><dt>{es ? "Saldo pendiente" : "Remaining balance"}</dt><dd>{formatCRC(result.balance)}</dd></div>
              </dl>
              <p>ⓘ {es ? "Realiza el pago desde tu aplicación bancaria. Usa esta referencia como concepto o nota del pago para que podamos identificar tu pedido." : "Make the payment in your banking app. Use this reference as the payment note so we can identify your order."}</p>
            </div>
          </div>
        </section>
        <section className="checkout-confirmation-card">
          <header><b>2</b><div><h2>{es ? "Sube tu comprobante" : "Upload your proof"}</h2><p>{es ? "Una vez realizado el pago, sube una captura clara del comprobante." : "Once payment is complete, upload a clear screenshot of the proof."}</p></div></header>
          <form className="checkout-proof-form" onSubmit={uploadProof}>
            <label className={`checkout-proof-dropzone${proofPreview ? " is-ready" : ""}`}>
              {proofPreview ? <Image src={proofPreview} alt={es ? "Vista previa del comprobante" : "Payment proof preview"} fill unoptimized/> : <><span aria-hidden="true">⌑</span><strong>{es ? "Arrastra tu comprobante aquí" : "Drop your proof here"}</strong><span>{es ? "o haz clic para seleccionarlo" : "or click to choose it"}</span><small>JPG, PNG o WebP (máx. 5 MB)</small></>}
              <input name="proof" type="file" accept="image/jpeg,image/png,image/webp" required onChange={event => {
                const file = event.currentTarget.files?.[0] ?? null;
                setProofFile(file);
                setProofPreview(current => { if (current) URL.revokeObjectURL(current); return file ? URL.createObjectURL(file) : ""; });
              }}/>
            </label>
            {proofFile && <p className="checkout-proof-caption">{proofFile.name} · {Math.ceil(proofFile.size / 1024)} KB</p>}
            {proofMessage && <p role="status" className="checkout-proof-message">{proofMessage}</p>}
            <button className="commerce-primary" disabled={proofLoading}>{proofLoading ? (es ? "Subiendo comprobante…" : "Uploading proof…") : (es ? "Enviar comprobante" : "Send proof")}</button>
          </form>
        </section>
      </div>
      <footer className="checkout-confirmation-footer"><div><strong>{es ? "¿Qué sigue?" : "What happens next?"}</strong><p>{es ? "Pago enviado → Verificamos tu comprobante → Preparamos tu pedido → Entrega o retiro." : "Payment sent → We verify your proof → We prepare your order → Delivery or pickup."}</p></div><Link className={proofUploaded ? "is-priority" : undefined} href={result.trackingUrl}>{es ? "Ver seguimiento del pedido →" : "Track your order →"}</Link></footer>
      <Link className="checkout-continue-shopping" href="/flores">{es ? "Seguir comprando  →" : "Continue shopping  →"}</Link>
    </section>;
  }

  return <form ref={checkoutForm} className="checkout-layout" onSubmit={event => { event.preventDefault(); if (paymentQuote) setPaymentConfirmationOpen(true); }}>
    <div className="checkout-main">
      <section className="checkout-card"><header><span className="checkout-icon" aria-hidden="true">♙</span><div><h2>{es ? "Información de contacto" : "Contact information"}</h2><p>{es ? "Te mantendremos informado sobre tu pedido." : "We will keep you updated about your order."}</p></div></header><div className="checkout-contact-grid"><label>{es ? "Nombre completo" : "Full name"}<input name="name" placeholder={es ? "Tu nombre completo" : "Your full name"} required minLength={2}/></label><label>{es ? "Teléfono" : "Phone"}<input name="phone" placeholder="+506 6123 4567" required minLength={7}/></label><label className="checkout-field-wide">{es ? "Correo electrónico" : "Email address"}<input name="email" type="email" placeholder="tu@email.com" required/></label></div></section>
      <section className="checkout-card"><header><span className="checkout-icon" aria-hidden="true">♧</span><div><h2>{es ? "Entrega" : "Delivery"}</h2><p>{es ? "Selecciona cómo quieres recibir tu pedido." : "Choose how you would like to receive your order."}</p></div></header><div className="checkout-delivery-options"><label className={`checkout-delivery-option${fulfillment === "pickup" ? " is-selected" : ""}`}><input type="radio" checked={fulfillment === "pickup"} onChange={() => setFulfillment("pickup")}/><span aria-hidden="true">⌂</span><strong>{es ? "Retiro en tienda" : "Store pickup"}</strong><small>{es ? "Pasa a recoger tu pedido en nuestro local." : "Pick up your order at our store."}</small></label><label className={`checkout-delivery-option${fulfillment === "delivery" ? " is-selected" : ""}`}><input type="radio" checked={fulfillment === "delivery"} onChange={() => setFulfillment("delivery")}/><span aria-hidden="true">⌂</span><strong>{es ? "Entrega a domicilio" : "Home delivery"}</strong><small>{es ? "Recibe tu pedido en la dirección que indiques." : "Receive your order at the address you provide."}</small></label></div>{fulfillment === "delivery" ? <label className="checkout-address">{es ? "Dirección de entrega" : "Delivery address"}<textarea name="deliveryAddress" placeholder={es ? "Indica la dirección donde deseas recibir tu pedido" : "Enter the delivery address"} required/></label> : <p className="checkout-notice">{es ? "Te avisaremos cuando tu pedido esté listo para ser retirado." : "We will let you know when your order is ready for pickup."}</p>}</section>
      <section className="checkout-card">
        <header><span className="checkout-icon" aria-hidden="true">▣</span><div><h2>{es ? "Método de pago" : "Payment method"}</h2><p>{es ? "Elige si quieres enviar el adelanto o pagar el pedido completo." : "Choose whether to send the required deposit or pay the full order now."}</p></div></header>
        <div className="checkout-payment-option"><span className="checkout-payment-mark">Zelle</span><div><strong>Zelle</strong><small>{es ? "Pagarás usando Zelle." : "You will pay using Zelle."}</small><small className="checkout-zelle-note">{es ? "Después de confirmar tu pedido te mostraremos los datos para realizar el pago." : "After confirming your order, we will show you the payment details."}</small></div></div>
        {quote && (quote.deposit < quote.total ? <div className="checkout-payment-options"><label className={`checkout-payment-choice${paymentOption === "deposit" ? " is-selected" : ""}`}><input type="radio" name="paymentOption" value="deposit" checked={paymentOption === "deposit"} onChange={() => setPaymentOption("deposit")}/><span><strong>{es ? `Pagar adelanto (${quote.depositPercent}%)` : `Pay required deposit (${quote.depositPercent}%)`}</strong><small>{es ? `${formatCRC(quote.deposit)} ahora · ${formatCRC(quote.balance)} pendiente` : `${formatCRC(quote.deposit)} now · ${formatCRC(quote.balance)} remaining`}</small></span></label><label className={`checkout-payment-choice${paymentOption === "full" ? " is-selected" : ""}`}><input type="radio" name="paymentOption" value="full" checked={paymentOption === "full"} onChange={() => setPaymentOption("full")}/><span><strong>{es ? "Pagar 100% ahora" : "Pay 100% now"}</strong><small>{es ? `${formatCRC(quote.total)} ahora · sin saldo pendiente` : `${formatCRC(quote.total)} now · no remaining balance`}</small></span></label></div> : <p className="checkout-payment-required">{es ? `Este pedido requiere el pago total de ${formatCRC(quote.total)}.` : `This order requires full payment of ${formatCRC(quote.total)}.`}</p>)}
      </section>
      {error && <p role="alert" className="checkout-error">{error}</p>}
      <button className="commerce-primary checkout-submit" disabled={loading || !paymentQuote}>{loading ? (es ? "Procesando…" : "Processing…") : (es ? "Continuar con Zelle" : "Continue with Zelle")} <span aria-hidden="true">→</span></button>
      <p className="checkout-security">⌑ {es ? "Tu información está protegida y segura." : "Your information is protected and secure."}</p>
    </div>
    <aside className="checkout-sidebar">
      <section className="checkout-card checkout-order-summary">
        <header><span className="checkout-icon" aria-hidden="true">⌑</span><div><h2>{es ? "Resumen del pedido" : "Order summary"}</h2></div><Link href="/carrito">{es ? "Volver al carrito" : "Back to cart"}</Link></header>
        <div className="checkout-order-items">{cart.map((item, index) => <article key={`${item.slug}-${index}`}><Image src={item.image ?? "/home-hero.webp"} alt={item.name} width={82} height={82}/><div><strong>{item.name}</strong><small>{item.kind === "combo" ? (es ? "Combo" : "Gift set") : (es ? "Selección floral" : "Floral selection")}</small><em>{es ? `Cant. ${item.quantity}` : `Qty. ${item.quantity}`}</em></div><b>{formatCRC(item.price * item.quantity)}</b></article>)}</div>
        <dl className="checkout-summary-totals"><div><dt>{es ? "Subtotal" : "Subtotal"}</dt><dd>{formatCRC(quote?.subtotal ?? total)}</dd></div><div><dt>{es ? "Entrega" : "Delivery"}</dt><dd>{quote ? formatCRC(quote.deliveryFee) : "—"}</dd></div><div className="checkout-summary-total"><dt>{es ? "Total" : "Total"}</dt><dd>{quote ? formatCRC(quote.total) : "—"}</dd></div>{paymentQuote && <><div className="checkout-summary-payment"><dt>{es ? `Pago requerido hoy (${paymentQuote.depositPercent}%)` : `Payment due today (${paymentQuote.depositPercent}%)`}</dt><dd>{formatCRC(paymentQuote.deposit)}</dd></div><div><dt>{es ? "Saldo pendiente" : "Remaining balance"}</dt><dd>{formatCRC(paymentQuote.balance)}</dd></div></>}</dl>
      </section>
      <section className="checkout-card checkout-gift-note"><header><span className="checkout-icon" aria-hidden="true">♢</span><div><h2>{es ? "¿Es un regalo?" : "Is it a gift?"}</h2><p>{es ? "Agrega una dedicatoria para acompañar tu pedido." : "Add a note to accompany your order."}</p></div></header><textarea value={giftNote} maxLength={500} placeholder={es ? "Escribe tu mensaje aquí (opcional)" : "Write your message here (optional)"} onChange={event => setGiftNote(event.target.value)}/><small>{giftNote.length}/500</small></section>
    </aside>
    {paymentQuote && <CheckoutPaymentConfirmation open={paymentConfirmationOpen} quote={paymentQuote} locale={locale} loading={loading} onCancel={() => setPaymentConfirmationOpen(false)} onConfirm={createOrder}/>}
  </form>;
}
