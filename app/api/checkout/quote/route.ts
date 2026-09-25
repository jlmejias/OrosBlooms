import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { combos, products, productVariants, siteSettings } from "@/db/schema";
import { calculateOrderPricing } from "@/lib/order-pricing";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";

const productLine = z.object({ kind: z.literal("product"), productId: z.string().uuid(), variantId: z.string().uuid().optional(), quantity: z.number().int().min(1).max(20) });
const comboLine = z.object({ kind: z.literal("combo"), comboId: z.string().uuid(), quantity: z.number().int().min(1).max(20) });
const schema = z.object({ fulfillment: z.enum(["delivery", "pickup"]), items: z.array(z.discriminatedUnion("kind", [productLine, comboLine])).min(1).max(30) });

export async function POST(request: Request) {
  try {
    const rate = await consumeRateLimit("checkout-quote", clientIp(request.headers), { limit: 60, windowSeconds: 600 });
    if (!rate.allowed) return NextResponse.json({ error: "Demasiadas consultas de precio." }, { status: 429 });
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Carrito inválido." }, { status: 400 });
    let subtotal = 0;
    const now = new Date();
    for (const item of parsed.data.items) {
      if (item.kind === "combo") {
        const [combo] = await db.select().from(combos).where(eq(combos.id, item.comboId)).limit(1);
        if (!combo || !combo.active || (combo.startsAt && combo.startsAt > now) || (combo.endsAt && combo.endsAt <= now)) return NextResponse.json({ error: "Un combo ya no está disponible." }, { status: 409 });
        subtotal += (combo.promotionalPrice ?? combo.price) * item.quantity;
        continue;
      }
      const [product] = await db.select({ id: products.id, basePrice: products.basePrice, status: products.status }).from(products).where(eq(products.id, item.productId)).limit(1);
      if (!product || product.status !== "active") return NextResponse.json({ error: "Un producto ya no está disponible." }, { status: 409 });
      const [variant] = await db.select({ id: productVariants.id, price: productVariants.price, available: productVariants.available, stock: productVariants.stockOnHand }).from(productVariants).where(item.variantId ? and(eq(productVariants.id, item.variantId), eq(productVariants.productId, product.id)) : and(eq(productVariants.productId, product.id), eq(productVariants.available, true))).orderBy(asc(productVariants.sortOrder)).limit(1);
      if (item.variantId && (!variant || !variant.available)) return NextResponse.json({ error: "Una presentación ya no está disponible." }, { status: 409 });
      if (variant?.stock !== null && variant?.stock !== undefined && variant.stock < item.quantity) return NextResponse.json({ error: "No hay existencias suficientes." }, { status: 409 });
      subtotal += (variant?.price ?? product.basePrice) * item.quantity;
    }
    const [businessRow] = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "business")).limit(1);
    const business = (businessRow?.value ?? {}) as Record<string, unknown>;
    const configuredDeliveryFee = Number(business.deliveryFee ?? process.env.DELIVERY_FEE_CRC ?? 0);
    const deliveryFee = parsed.data.fulfillment === "delivery" && Number.isFinite(configuredDeliveryFee) ? configuredDeliveryFee : 0;
    const depositPercent = Number(business.depositPercent ?? 100);
    return NextResponse.json(calculateOrderPricing(subtotal, deliveryFee, depositPercent));
  } catch (error) {
    console.error("checkout_quote_failed", error);
    return NextResponse.json({ error: "No se pudo calcular el pedido." }, { status: 500 });
  }
}
