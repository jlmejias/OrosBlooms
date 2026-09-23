import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { mediaAssets, orders } from "@/db/schema";
import { uploadPrivateBlob } from "@/lib/blob";

export async function POST(request: Request) {
  const form = await request.formData(); const reference = String(form.get("reference") ?? ""); const token = String(form.get("token") ?? ""); const file = form.get("proof");
  if (!(file instanceof File) || !reference || !token || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5_000_000) return NextResponse.json({ error: "Comprobante inválido." }, { status: 400 });
  const [order] = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.reference, reference), eq(orders.trackingToken, token), eq(orders.paymentMethod, "sinpe"))).limit(1);
  if (!order) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const blob = await uploadPrivateBlob(`payments/${randomUUID()}.${extension}`, file);
  const [asset] = await db.insert(mediaAssets).values({ provider: "neon-object-storage-private", providerId: blob.pathname, url: blob.url, bytes: file.size, format: extension, alt: `Comprobante SINPE ${reference}`, visibility: "private" }).returning({ id: mediaAssets.id });
  await db.update(orders).set({ paymentProofAssetId: asset.id, paymentStatus: "pending_review", updatedAt: new Date() }).where(eq(orders.id, order.id));
  return NextResponse.json({ ok: true });
}
