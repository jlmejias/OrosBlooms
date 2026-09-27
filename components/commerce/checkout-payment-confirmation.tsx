"use client";

import { Modal } from "antd";
import { formatCRC } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

type Quote = { subtotal: number; deliveryFee: number; total: number; depositPercent: number; deposit: number; balance: number };

export function CheckoutPaymentConfirmation({ open, quote, locale, loading, onCancel, onConfirm }: { open: boolean; quote: Quote; locale: Locale; loading: boolean; onCancel: () => void; onConfirm: () => Promise<void> }) {
  const es = locale === "es";
  return <Modal className="checkout-payment-modal" width={590} open={open} centered title={<span className="checkout-payment-modal-title">{es ? "Confirma tu pago con Zelle" : "Confirm your Zelle payment"}</span>} okText={es ? "Crear pedido  →" : "Create order  →"} cancelText={es ? "Volver a revisar" : "Review order"} cancelButtonProps={{ className: "checkout-confirm-cancel" }} okButtonProps={{ className: "checkout-confirm-payment" }} confirmLoading={loading} onCancel={onCancel} onOk={onConfirm}>
    <p className="checkout-confirm-copy">{es ? "Revisa el monto antes de crear tu pedido. Después recibirás los datos de Zelle y podrás subir tu comprobante." : "Review the amounts before creating your order. You will then receive the Zelle details and be able to upload your proof."}</p>
    <dl className="checkout-confirm-breakdown">
      <div><dt>{es ? "Subtotal" : "Subtotal"}</dt><dd>{formatCRC(quote.subtotal)}</dd></div>
      <div><dt>{es ? "Entrega" : "Delivery"}</dt><dd>{formatCRC(quote.deliveryFee)}</dd></div>
      <div className="checkout-confirm-total"><dt>{es ? "Total del pedido" : "Order total"}</dt><dd>{formatCRC(quote.total)}</dd></div>
      <div className="checkout-confirm-deposit"><dt>{es ? `Pago requerido hoy · ${quote.depositPercent}%` : `Payment due today · ${quote.depositPercent}%`}</dt><dd>{formatCRC(quote.deposit)}</dd></div>
      <div><dt>{es ? "Saldo pendiente" : "Remaining balance"}</dt><dd>{formatCRC(quote.balance)}</dd></div>
    </dl>
  </Modal>;
}
