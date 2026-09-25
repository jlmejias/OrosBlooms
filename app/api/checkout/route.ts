import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { comboItems, combos, customers, orderInventoryItems, orderItems, orders, productVariants, products, siteSettings } from "@/db/schema";
import { customerIdentityKey, normalizeEmail, normalizePhone } from "@/lib/customer-identity";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";
import { calculateOrderPricing } from "@/lib/order-pricing";

const productLineSchema = z.object({ kind: z.literal("product"), productId: z.string().uuid(), variantId: z.string().uuid().optional(), quantity: z.number().int().min(1).max(20), personalization: z.string().trim().max(500).optional() });
const comboLineSchema = z.object({ kind: z.literal("combo"), comboId: z.string().uuid(), quantity: z.number().int().min(1).max(20), personalization: z.string().trim().max(500).optional() });
const bodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().trim().min(7).max(30),
  fulfillment: z.enum(["delivery", "pickup"]),
  deliveryAddress: z.string().trim().max(500).optional(),
  paymentMethod: z.literal("sinpe"),
  items: z.array(z.discriminatedUnion("kind", [productLineSchema, comboLineSchema])).min(1).max(30),
}).refine(value => value.fulfillment === "pickup" || Boolean(value.deliveryAddress), { message: "Dirección requerida para entrega" });

type OrderLine = { productId?: string; variantId?: string; comboId?: string; name: string; unitPrice: number; quantity: number; personalization?: string };
class CheckoutError extends Error { constructor(message: string, readonly status = 409) { super(message); } }

function responseFor(order: { reference: string; trackingToken: string; deposit: number }) {
  return { reference: order.reference, trackingToken: order.trackingToken, trackingUrl: `/pedido/${order.reference}?token=${order.trackingToken}`, sinpeNumber: process.env.SINPE_MOBILE_NUMBER || null, amount: order.deposit };
}

export async function POST(request: Request) {
  try {
    const rate = await consumeRateLimit("checkout", clientIp(request.headers), { limit: 10, windowSeconds: 600 });
    if (!rate.allowed) return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos antes de volver a intentar." }, { status: 429 });
    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey || !z.string().uuid().safeParse(idempotencyKey).success) return NextResponse.json({ error: "Solicitud de compra inválida." }, { status: 400 });
    const rawBody: unknown = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) return NextResponse.json({ error: "Datos de compra inválidos." }, { status: 400 });
    if (!process.env.SINPE_MOBILE_NUMBER) return NextResponse.json({ error: "SINPE Móvil todavía no está configurado. Intenta de nuevo más tarde o contáctanos." }, { status: 503 });
    const value = parsed.data;

    const result = await db.transaction(async tx => {
      const [existing] = await tx.select({ reference: orders.reference, trackingToken: orders.trackingToken, deposit: orders.deposit }).from(orders).where(eq(orders.idempotencyKey, idempotencyKey)).limit(1);
      if (existing) return existing;

      const directProductIds = value.items.flatMap(item => item.kind === "product" ? [item.productId] : []);
      const comboIds = value.items.flatMap(item => item.kind === "combo" ? [item.comboId] : []);
      const productRows = directProductIds.length ? await tx.select({ id: products.id, name: products.name, basePrice: products.basePrice, status: products.status }).from(products).where(inArray(products.id, directProductIds)) : [];
      const productById = new Map(productRows.map(row => [row.id, row]));
      const comboRows = comboIds.length ? await tx.select().from(combos).where(inArray(combos.id, comboIds)) : [];
      const comboById = new Map(comboRows.map(row => [row.id, row]));
      const now = new Date();
      const lines: OrderLine[] = [];
      const inventory = new Map<string, number>();

      const resolveVariant = async (productId: string, requestedId?: string) => {
        const rows = await tx.select({ id: productVariants.id, productId: productVariants.productId, price: productVariants.price, available: productVariants.available, stock: productVariants.stockOnHand }).from(productVariants).where(requestedId ? and(eq(productVariants.id, requestedId), eq(productVariants.productId, productId)) : and(eq(productVariants.productId, productId), eq(productVariants.available, true))).orderBy(asc(productVariants.sortOrder)).limit(1);
        const variant = rows[0];
        if (requestedId && (!variant || !variant.available)) throw new CheckoutError("Una presentación ya no está disponible.");
        return variant;
      };
      const addInventory = (variantId: string, quantity: number, stock: number | null) => {
        const needed = (inventory.get(variantId) ?? 0) + quantity;
        if (stock !== null && stock < needed) throw new CheckoutError("No hay existencias suficientes para completar el pedido.");
        inventory.set(variantId, needed);
      };

      for (const item of value.items) {
        if (item.kind === "product") {
          const product = productById.get(item.productId);
          if (!product || product.status !== "active") throw new CheckoutError("Un producto ya no está disponible.");
          const variant = await resolveVariant(product.id, item.variantId);
          if (variant) addInventory(variant.id, item.quantity, variant.stock);
          lines.push({ productId: product.id, variantId: variant?.id, name: product.name, unitPrice: variant?.price ?? product.basePrice, quantity: item.quantity, personalization: item.personalization });
          continue;
        }
        const combo = comboById.get(item.comboId);
        if (!combo || !combo.active || (combo.startsAt && combo.startsAt > now) || (combo.endsAt && combo.endsAt <= now)) throw new CheckoutError("Un combo ya no está disponible.");
        const components = await tx.select({ productId: comboItems.productId, variantId: comboItems.variantId, quantity: comboItems.quantity, status: products.status }).from(comboItems).innerJoin(products, eq(products.id, comboItems.productId)).where(eq(comboItems.comboId, combo.id));
        if (!components.length || components.some(component => component.status !== "active")) throw new CheckoutError("La composición de un combo ya no está disponible.");
        for (const component of components) {
          const variant = await resolveVariant(component.productId, component.variantId ?? undefined);
          if (variant) addInventory(variant.id, component.quantity * item.quantity, variant.stock);
        }
        lines.push({ comboId: combo.id, name: combo.name, unitPrice: combo.promotionalPrice ?? combo.price, quantity: item.quantity, personalization: item.personalization });
      }

      const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
      const [businessRow] = await tx.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "business")).limit(1);
      const business = (businessRow?.value ?? {}) as Record<string, unknown>;
      const configuredDeliveryFee = Number(business.deliveryFee ?? process.env.DELIVERY_FEE_CRC ?? 0);
      const deliveryFee = value.fulfillment === "delivery" && Number.isFinite(configuredDeliveryFee) ? Math.max(0, Math.round(configuredDeliveryFee)) : 0;
      const depositPercent = Math.min(100, Math.max(0, Number(business.depositPercent ?? 100)));
      const pricing = calculateOrderPricing(subtotal, deliveryFee, depositPercent);
      const normalizedEmail = normalizeEmail(value.email);
      const normalizedPhone = normalizePhone(value.phone);
      const identityKey = customerIdentityKey(normalizedEmail, normalizedPhone);
      const [createdCustomer] = await tx.insert(customers).values({ identityKey, name: value.name, email: normalizedEmail, phone: normalizedPhone, contactPreference: "whatsapp" }).onConflictDoNothing({ target: customers.identityKey }).returning({ id: customers.id });
      const customerId = createdCustomer?.id ?? (await tx.select({ id: customers.id }).from(customers).where(eq(customers.identityKey, identityKey)).limit(1))[0]?.id;
      if (!customerId) throw new Error("customer_identity_resolution_failed");
      const reference = `PED-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
      const trackingToken = randomUUID().replaceAll("-", "");
      const [order] = await tx.insert(orders).values({ reference, idempotencyKey, trackingToken, customerId, fulfillment: value.fulfillment, deliveryAddress: value.deliveryAddress || null, subtotal: pricing.subtotal, deliveryFee: pricing.deliveryFee, total: pricing.total, deposit: pricing.deposit, balance: pricing.balance, paymentMethod: "sinpe", paymentStatus: "unpaid", status: "pending" }).returning({ id: orders.id, reference: orders.reference, trackingToken: orders.trackingToken, deposit: orders.deposit });
      await tx.insert(orderItems).values(lines.map(line => ({ orderId: order.id, productId: line.productId, variantId: line.variantId, comboId: line.comboId, nameSnapshot: line.name, unitPriceSnapshot: line.unitPrice, quantity: line.quantity, personalization: line.personalization ? { message: line.personalization } : null, lineTotal: line.unitPrice * line.quantity })));
      if (inventory.size) await tx.insert(orderInventoryItems).values([...inventory].map(([variantId, quantity]) => ({ orderId: order.id, variantId, quantity })));
      return order;
    });
    return NextResponse.json(responseFor(result));
  } catch (error) {
    if (error instanceof CheckoutError) return NextResponse.json({ error: error.message }, { status: error.status });
    const isDuplicate = typeof error === "object" && error !== null && "code" in error && error.code === "23505";
    if (isDuplicate) return NextResponse.json({ error: "La solicitud ya está siendo procesada. Intenta nuevamente." }, { status: 409 });
    console.error("checkout_failed", error);
    return NextResponse.json({ error: "No se pudo crear el pedido." }, { status: 500 });
  }
}
