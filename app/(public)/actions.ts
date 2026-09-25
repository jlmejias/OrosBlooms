"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { customers, inquiries, inquiryImages, mediaAssets } from "@/db/schema";
import { deletePrivateBlob, uploadPrivateBlob } from "@/lib/blob";
import { customerIdentityKey, normalizeEmail, normalizePhone } from "@/lib/customer-identity";
import { sendInquiryEmails } from "@/lib/email";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";
import { hasValidImageSignature } from "@/lib/upload-validation";

const inquirySchema = z.object({ name: z.string().trim().min(2).max(120), email: z.email().optional().or(z.literal("")), phone: z.string().trim().min(7).max(30), type: z.string().trim().min(2).max(50), occasion: z.string().trim().max(80).optional(), style: z.string().trim().max(80).optional(), colors: z.string().trim().max(200).optional(), budgetMin: z.coerce.number().int().min(0).optional(), budgetMax: z.coerce.number().int().min(0).optional(), requiredAt: z.string().optional(), fulfillment: z.enum(["delivery", "pickup"]), notes: z.string().trim().max(2000).optional(), idempotencyKey: z.string().uuid() }).refine(value => value.budgetMin === undefined || value.budgetMax === undefined || value.budgetMin <= value.budgetMax, "Presupuesto inválido");

export async function createInquiry(formData: FormData) {
  const rate = await consumeRateLimit("inquiry", clientIp(await headers()), { limit: 5, windowSeconds: 1800 });
  if (!rate.allowed) redirect("/solicitar?error=rate");
  const parsed = inquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/solicitar?error=datos");
  const value = parsed.data;
  const [existing] = await db.select({ reference: inquiries.reference }).from(inquiries).where(eq(inquiries.idempotencyKey, value.idempotencyKey)).limit(1);
  if (existing) redirect(`/solicitar/gracias?ref=${encodeURIComponent(existing.reference)}`);

  const files = formData.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > 3) redirect("/solicitar?error=archivos");
  for (const file of files) {
    if (file.size > 5_000_000 || !hasValidImageSignature(new Uint8Array(await file.arrayBuffer()), file.type)) redirect("/solicitar?error=archivos");
  }

  const uploaded: Array<{ pathname: string; url: string; file: File; extension: string }> = [];
  try {
    for (const file of files) {
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const blob = await uploadPrivateBlob(`inquiries/${randomUUID()}.${extension}`, file);
      uploaded.push({ ...blob, file, extension });
    }
  } catch (error) {
    await Promise.allSettled(uploaded.map(item => deletePrivateBlob(item.pathname)));
    console.error("inquiry_upload_failed", error);
    redirect("/solicitar?error=archivos");
  }

  const normalizedEmail = normalizeEmail(value.email);
  const normalizedPhone = normalizePhone(value.phone);
  const identityKey = customerIdentityKey(normalizedEmail, normalizedPhone);
  const reference = `OB-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
  let inquiryId: string;
  try {
    inquiryId = await db.transaction(async tx => {
      const [createdCustomer] = await tx.insert(customers).values({ identityKey, name: value.name, email: normalizedEmail, phone: normalizedPhone, contactPreference: "whatsapp" }).onConflictDoNothing({ target: customers.identityKey }).returning({ id: customers.id });
      const customerId = createdCustomer?.id ?? (await tx.select({ id: customers.id }).from(customers).where(eq(customers.identityKey, identityKey)).limit(1))[0]?.id;
      if (!customerId) throw new Error("customer_identity_resolution_failed");
      const [inquiry] = await tx.insert(inquiries).values({ reference, idempotencyKey: value.idempotencyKey, customerId, type: value.type, occasion: value.occasion || null, style: value.style || null, colors: value.colors ? value.colors.split(",").map(item => item.trim()).filter(Boolean) : null, budgetMin: value.budgetMin, budgetMax: value.budgetMax, requiredAt: value.requiredAt ? new Date(`${value.requiredAt}T12:00:00-06:00`) : null, fulfillment: value.fulfillment, notes: value.notes || null, notificationStatus: "pending" }).returning({ id: inquiries.id });
      for (const [index, item] of uploaded.entries()) {
        const [asset] = await tx.insert(mediaAssets).values({ provider: "neon-object-storage-private", providerId: item.pathname, url: item.url, bytes: item.file.size, format: item.extension, alt: `Referencia privada ${index + 1}`, visibility: "private" }).returning({ id: mediaAssets.id });
        await tx.insert(inquiryImages).values({ inquiryId: inquiry.id, mediaAssetId: asset.id, sortOrder: index });
      }
      return inquiry.id;
    });
  } catch (error) {
    await Promise.allSettled(uploaded.map(item => deletePrivateBlob(item.pathname)));
    console.error("inquiry_database_failed", error);
    const [duplicate] = await db.select({ reference: inquiries.reference }).from(inquiries).where(eq(inquiries.idempotencyKey, value.idempotencyKey)).limit(1);
    if (duplicate) redirect(`/solicitar/gracias?ref=${encodeURIComponent(duplicate.reference)}`);
    redirect("/solicitar?error=servidor");
  }

  try {
    const result = await sendInquiryEmails({ reference, name: value.name, email: value.email || undefined, phone: value.phone, type: value.type, occasion: value.occasion, style: value.style, colors: value.colors, budgetMin: value.budgetMin, budgetMax: value.budgetMax, requiredAt: value.requiredAt, fulfillment: value.fulfillment, notes: value.notes });
    await db.update(inquiries).set({ notificationStatus: result.sent ? "sent" : "failed", notificationError: result.sent ? null : result.reason, notificationAttempts: 1, updatedAt: new Date() }).where(eq(inquiries.id, inquiryId));
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Error desconocido";
    await db.update(inquiries).set({ notificationStatus: "failed", notificationError: message, notificationAttempts: 1, updatedAt: new Date() }).where(eq(inquiries.id, inquiryId));
    console.error("inquiry_email_failed", { reference, error });
  }
  redirect(`/solicitar/gracias?ref=${encodeURIComponent(reference)}`);
}
