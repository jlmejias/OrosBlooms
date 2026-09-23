import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/commerce/public-shell";
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
  const [order] = await db.select({ reference: orders.reference, status: orders.status, paymentStatus: orders.paymentStatus, total: orders.total, fulfillment: orders.fulfillment }).from(orders).where(and(eq(orders.reference, reference), eq(orders.trackingToken, token))).limit(1);
  if (!order) notFound();
  const locale = await getLocale(); const es = locale === "es";
  const paid = order.paymentStatus === "paid";
  return <PublicShell><div className="commerce-wrap"><section className="cart-empty"><p className="commerce-kicker">{es ? "Seguimiento de pedido" : "Order tracking"}</p><h1>{order.reference}</h1><p>{es ? `Estado: ${labels.es[order.status]}` : `Status: ${labels.en[order.status]}`}</p><p>{paid ? (es ? "Pago confirmado." : "Payment confirmed.") : (es ? "Pago pendiente de confirmación." : "Payment pending confirmation.")}</p><p>{es ? "Total" : "Total"}: <strong>{formatCRC(order.total)}</strong></p><p>{order.fulfillment === "delivery" ? (es ? "Entrega a domicilio" : "Delivery") : (es ? "Retiro en tienda" : "Store pickup")}</p></section></div></PublicShell>;
}
