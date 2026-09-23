import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { customers, orderItems, orders, productVariants, products } from "@/db/schema";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(120), email: z.email().optional().or(z.literal("")), phone: z.string().trim().min(7).max(30),
  fulfillment: z.enum(["delivery", "pickup"]), deliveryAddress: z.string().trim().max(500).optional(), paymentMethod: z.enum(["stripe", "sinpe"]),
  items: z.array(z.object({ productId: z.string().uuid(), variantId: z.string().uuid().optional(), quantity: z.number().int().min(1).max(20), personalization: z.string().max(500).optional() })).min(1).max(30),
}).refine(value => value.fulfillment === "pickup" || Boolean(value.deliveryAddress), "Dirección requerida para entrega");

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos de compra inválidos." }, { status: 400 });
  const value = parsed.data;
  if (value.paymentMethod === "stripe" && !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "El pago con tarjeta todavía no está disponible. Elige SINPE Móvil." }, { status: 503 });
  const variantIds = value.items.flatMap(item => item.variantId ? [item.variantId] : []);
  const rows = variantIds.length ? await db.select({ id: productVariants.id, productId: productVariants.productId, name: products.name, price: productVariants.price, available: productVariants.available, stock: productVariants.stockOnHand }).from(productVariants).innerJoin(products, eq(products.id, productVariants.productId)).where(and(inArray(productVariants.id, variantIds), eq(products.status, "active"))) : [];
  const byVariant = new Map(rows.map(row => [row.id, row]));
  if (variantIds.length !== value.items.length || value.items.some(item => { const row = item.variantId && byVariant.get(item.variantId); return !row || row.productId !== item.productId || !row.available || (row.stock !== null && row.stock < item.quantity); })) return NextResponse.json({ error: "Un producto ya no está disponible." }, { status: 409 });
  const subtotal = value.items.reduce((sum, item) => sum + (byVariant.get(item.variantId!)!.price * item.quantity), 0);
  const deliveryFee = value.fulfillment === "delivery" ? Math.max(0, Number(process.env.DELIVERY_FEE_CRC ?? 0)) : 0;
  const total = subtotal + deliveryFee;
  const deposit = total;
  const [customer] = await db.insert(customers).values({ name: value.name, email: value.email || null, phone: value.phone, contactPreference: "whatsapp" }).onConflictDoNothing().returning();
  const customerId = customer?.id ?? (await db.select({ id: customers.id }).from(customers).where(eq(customers.phone, value.phone)).limit(1))[0]?.id;
  if (!customerId) return NextResponse.json({ error: "No se pudo crear el cliente." }, { status: 500 });
  const reference = `PED-${Date.now().toString().slice(-8)}`;
  const trackingToken = randomUUID().replaceAll("-", "");
  const [order] = await db.insert(orders).values({ reference, trackingToken, customerId, fulfillment: value.fulfillment, deliveryAddress: value.deliveryAddress || null, subtotal, deliveryFee, total, deposit, balance: 0, paymentMethod: value.paymentMethod, paymentStatus: "unpaid", status: "pending" }).returning();
  await db.insert(orderItems).values(value.items.map(item => { const row = byVariant.get(item.variantId!); return { orderId: order.id, productId: item.productId, variantId: item.variantId, nameSnapshot: row!.name, unitPriceSnapshot: row!.price, quantity: item.quantity, personalization: item.personalization ? { message: item.personalization } : null, lineTotal: row!.price * item.quantity }; }));
  if (value.paymentMethod === "sinpe") return NextResponse.json({ reference, trackingToken, trackingUrl: `/pedido/${reference}?token=${trackingToken}`, sinpeNumber: process.env.SINPE_MOBILE_NUMBER || null, amount: deposit });
  return NextResponse.json({ reference, trackingToken, trackingUrl: `/pedido/${reference}?token=${trackingToken}`, amount: deposit, paymentPending: true });
}
