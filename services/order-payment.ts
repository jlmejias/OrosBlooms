import { and, eq, gte, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { orderInventoryItems, orders, productVariants } from "@/db/schema";

export async function reviewOrderPaymentById(id: string, paymentStatus: "paid" | "failed") {
  return db.transaction(async tx => {
    await tx.execute(sql`SELECT id FROM orders WHERE id = ${id} FOR UPDATE`);
    const [order] = await tx.select({ paymentStatus: orders.paymentStatus, status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) throw new Error("Pedido no encontrado.");
    if (order.paymentStatus === paymentStatus) return { changed: false };
    if (order.paymentStatus !== "pending_review") throw new Error("Solo se puede revisar un pago pendiente.");
    if (paymentStatus === "paid") {
      const items = await tx.select({ variantId: orderInventoryItems.variantId, quantity: orderInventoryItems.quantity }).from(orderInventoryItems).where(eq(orderInventoryItems.orderId, id));
      for (const item of items) {
        const [updated] = await tx.update(productVariants).set({ stockOnHand: sql`CASE WHEN ${productVariants.stockOnHand} IS NULL THEN NULL ELSE ${productVariants.stockOnHand} - ${item.quantity} END`, updatedAt: new Date() }).where(and(eq(productVariants.id, item.variantId), eq(productVariants.available, true), or(isNull(productVariants.stockOnHand), gte(productVariants.stockOnHand, item.quantity)))).returning({ id: productVariants.id });
        if (!updated) throw new Error("Inventario insuficiente o presentación inactiva. No se confirmó el pago.");
      }
    }
    await tx.update(orders).set({ paymentStatus, status: paymentStatus === "paid" && order.status === "pending" ? "confirmed" : order.status, updatedAt: new Date() }).where(eq(orders.id, id));
    return { changed: true };
  });
}
