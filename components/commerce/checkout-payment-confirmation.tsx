"use client";

import { Modal } from "antd";
import Link from "next/link";
import { formatCRC } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

type Quote = { subtotal: number; deliveryFee: number; total: number; depositPercent: number; deposit: number; balance: number };

export function CheckoutPaymentConfirmation({ open, quote, locale, loading, onCancel, onConfirm }: { open: boolean; quote: Quote; locale: Locale; loading: boolean; onCancel: () => void; onConfirm: () => Promise<void> }) {
  const es = locale === "es";
  return <Modal className="checkout-payment-modal" width={590} open={open} centered title={<span className="checkout-payment-modal-title">{es ? "Confirma tu pedido" : "Confirm your order"}</span>} okText={es ? "Confirmar y obtener datos de pago  →" : "Confirm and get payment details  →"} cancelText={es ? "Volver a revisar" : "Review order"} cancelButtonProps={{ className: "checkout-confirm-cancel" }} okButtonProps={{ className: "checkout-confirm-payment" }} confirmLoading={loading} onCancel={onCancel} onOk={onConfirm}>
    <p className="checkout-confirm-copy"><strong>{es ? `Pagarás ${formatCRC(quote.deposit)} ahora con Zelle.` : `You will pay ${formatCRC(quote.deposit)} now with Zelle.`}</strong><span>{es ? "Revisa el monto antes de confirmar tu pedido." : "Review the amount before confirming your order."}</span></p>
    <dl className="checkout-confirm-breakdown">
      <div><dt>{es ? "Subtotal" : "Subtotal"}</dt><dd>{formatCRC(quote.subtotal)}</dd></div>
      <div><dt>{es ? "Entrega" : "Delivery"}</dt><dd>{formatCRC(quote.deliveryFee)}</dd></div>
      <div className="checkout-confirm-total"><dt>{es ? "Total del pedido" : "Order total"}</dt><dd>{formatCRC(quote.total)}</dd></div>
      <div className="checkout-confirm-deposit"><dt>{es ? `Pago requerido hoy · ${quote.depositPercent}%` : `Payment due today · ${quote.depositPercent}%`}</dt><dd>{formatCRC(quote.deposit)}</dd></div>
      <div><dt>{es ? "Saldo después del pago" : "Balance after payment"}</dt><dd>{formatCRC(quote.balance)}</dd></div>
    </dl>
    <p style={{ margin: "1rem 0 0", color: "#687166", fontSize: ".75rem", lineHeight: 1.6 }}>
      {es ? "Al confirmar tu pedido, aceptas nuestros " : "By confirming your order, you accept our "}
      <Link href="/legal/terminos" target="_blank">{es ? "Términos y condiciones" : "Terms and Conditions"}</Link>
      {es ? " y nuestra " : " and our "}
      <Link href="/legal/privacidad" target="_blank">{es ? "Política de privacidad" : "Privacy Policy"}</Link>.
    </p>
  </Modal>;
}
