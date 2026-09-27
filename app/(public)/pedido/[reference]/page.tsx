import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/commerce/public-shell";
import { PaymentProofUploader } from "@/components/commerce/payment-proof-uploader";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { formatCRC } from "@/lib/format";
import { getLocale } from "@/lib/i18n";

const labels = {
  es: { pending: "Recibido", confirmed: "Confirmado", preparing: "En preparación", ready: "Listo", delivered: "Entregado", cancelled: "Cancelado", draft: "En revisión" },
  en: { pending: "Received", confirmed: "Confirmed", preparing: "Preparing", ready: "Ready", delivered: "Delivered", cancelled: "Cancelled", draft: "Under review" },
} as const;

export default async function TrackOrderPage({ params, searchParams }: { params: Promise<{ reference: string }>; searchParams: Promise<{ token?: string }> }) {
  const [{ reference }, { token }] = await Promise.all([params, searchParams]);
  if (!token) notFound();
  const [order] = await db.select({ reference: orders.reference, status: orders.status, paymentStatus: orders.paymentStatus, paymentMethod: orders.paymentMethod, total: orders.total, deposit: orders.deposit, balance: orders.balance, fulfillment: orders.fulfillment }).from(orders).where(and(eq(orders.reference, reference), eq(orders.trackingToken, token))).limit(1);
  if (!order) notFound();
  const locale = await getLocale(); const es = locale === "es";
  const paid = order.paymentStatus === "paid";
  const canUploadProof = ["zelle", "sinpe"].includes(order.paymentMethod ?? "") && ["unpaid", "failed"].includes(order.paymentStatus);
  const awaitingReview = order.paymentStatus === "pending_review";
  return <PublicShell><div className="commerce-wrap"><section className="order-tracking"><p className="commerce-kicker">{es ? "Seguimiento de pedido" : "Order tracking"}</p><h1>{order.reference}</h1><div className="order-tracking-details"><p>{es ? `Estado: ${labels.es[order.status]}` : `Status: ${labels.en[order.status]}`}</p><p>{paid ? order.balance > 0 ? (es ? "Adelanto confirmado; el saldo se coordinará contigo." : "Deposit confirmed; we will coordinate the remaining balance with you.") : (es ? "Pago confirmado." : "Payment confirmed.") : (es ? "Pago pendiente de confirmación." : "Payment pending confirmation.")}</p><p>{es ? "Total" : "Total"}: <strong>{formatCRC(order.total)}</strong></p><p>{order.balance > 0 ? (es ? <>Adelanto: <strong>{formatCRC(order.deposit)}</strong> · Saldo pendiente: <strong>{formatCRC(order.balance)}</strong></> : <>Deposit: <strong>{formatCRC(order.deposit)}</strong> · Remaining balance: <strong>{formatCRC(order.balance)}</strong></>) : (es ? <>Pago total: <strong>{formatCRC(order.deposit)}</strong></> : <>Full payment: <strong>{formatCRC(order.deposit)}</strong></>)}</p><p>{order.fulfillment === "delivery" ? (es ? "Entrega a domicilio" : "Delivery") : (es ? "Retiro en tienda" : "Store pickup")}</p></div>{awaitingReview && <section className="payment-proof-submitted order-tracking-proof-submitted"><span aria-hidden="true">✓</span><div><strong>{es ? "Comprobante enviado" : "Proof submitted"}</strong><p>{es ? "Ya recibimos tu comprobante y está pendiente de revisión. Te enviaremos un correo cuando confirmemos el pago." : "We received your proof and it is pending review. We will email you once payment is confirmed."}</p></div></section>}{canUploadProof && <section className="order-tracking-proof"><h2>{es ? "Sube tu comprobante" : "Upload your proof"}</h2><p>{order.balance > 0 ? (es ? `Envía el comprobante de tu adelanto de ${formatCRC(order.deposit)}. Quedará un saldo de ${formatCRC(order.balance)} por coordinar.` : `Upload proof of your ${formatCRC(order.deposit)} deposit. A remaining balance of ${formatCRC(order.balance)} will be coordinated with you.`) : (es ? `Envía el comprobante de tu pago total de ${formatCRC(order.deposit)}.` : `Upload proof of your full payment of ${formatCRC(order.deposit)}.`)}</p><PaymentProofUploader reference={order.reference} token={token} locale={locale}/></section>}</section></div></PublicShell>;
}
