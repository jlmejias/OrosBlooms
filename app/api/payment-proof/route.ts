import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { mediaAssets, orders } from "@/db/schema";
import { deletePrivateBlob, uploadPrivateBlob } from "@/lib/blob";
import { hasValidImageSignature } from "@/lib/upload-validation";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  let uploadedPath: string | undefined;
  try {
    const rate = await consumeRateLimit("payment-proof", clientIp(request.headers), { limit: 8, windowSeconds: 900 });
    if (!rate.allowed) return NextResponse.json({ error: "Demasiadas cargas. Espera antes de volver a intentar." }, { status: 429 });
    const form = await request.formData();
    const reference = String(form.get("reference") ?? "").trim();
    const token = String(form.get("token") ?? "").trim();
    const file = form.get("proof");
    if (!(file instanceof File) || !reference || !token || file.size <= 0 || file.size > 5_000_000) return NextResponse.json({ error: "Comprobante inválido." }, { status: 400 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasValidImageSignature(bytes, file.type)) return NextResponse.json({ error: "El contenido del archivo no coincide con una imagen permitida." }, { status: 400 });

    const [order] = await db.select({ id: orders.id, status: orders.status, paymentStatus: orders.paymentStatus, proofAssetId: orders.paymentProofAssetId, oldProviderId: mediaAssets.providerId }).from(orders).leftJoin(mediaAssets, eq(mediaAssets.id, orders.paymentProofAssetId)).where(and(eq(orders.reference, reference), eq(orders.trackingToken, token), eq(orders.paymentMethod, "sinpe"))).limit(1);
    if (!order) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
    if (order.status === "cancelled" || !["unpaid", "failed"].includes(order.paymentStatus)) return NextResponse.json({ error: order.paymentStatus === "pending_review" ? "El comprobante ya está pendiente de revisión." : "Este pedido ya no admite comprobantes." }, { status: 409 });

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const blob = await uploadPrivateBlob(`payments/${randomUUID()}.${extension}`, file);
    uploadedPath = blob.pathname;
    await db.transaction(async tx => {
      const [asset] = await tx.insert(mediaAssets).values({ provider: "neon-object-storage-private", providerId: blob.pathname, url: blob.url, bytes: file.size, format: extension, alt: `Comprobante SINPE ${reference}`, visibility: "private" }).returning({ id: mediaAssets.id });
      const [updated] = await tx.update(orders).set({ paymentProofAssetId: asset.id, paymentStatus: "pending_review", updatedAt: new Date() }).where(and(eq(orders.id, order.id), inArray(orders.paymentStatus, ["unpaid", "failed"]))).returning({ id: orders.id });
      if (!updated) throw new Error("proof_state_conflict");
    });
    uploadedPath = undefined;
    if (order.proofAssetId && order.oldProviderId) {
      await db.delete(mediaAssets).where(eq(mediaAssets.id, order.proofAssetId));
      await deletePrivateBlob(order.oldProviderId).catch(error => console.error("old_payment_proof_cleanup_failed", error));
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (uploadedPath) await deletePrivateBlob(uploadedPath).catch(cleanupError => console.error("payment_proof_cleanup_failed", cleanupError));
    if (error instanceof Error && error.message === "proof_state_conflict") return NextResponse.json({ error: "El comprobante ya fue recibido." }, { status: 409 });
    console.error("payment_proof_failed", error);
    return NextResponse.json({ error: "No se pudo procesar el comprobante." }, { status: 500 });
  }
}
