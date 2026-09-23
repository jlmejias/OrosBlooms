"use server";

import { randomUUID } from "node:crypto";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { customers, inquiries, inquiryImages, mediaAssets } from "@/db/schema";
import { sendInquiryEmails } from "@/lib/email";
import { uploadPrivateBlob } from "@/lib/blob";

const inquirySchema = z.object({ name: z.string().trim().min(2).max(120), email: z.email().optional().or(z.literal("")), phone: z.string().trim().min(7).max(30), type: z.string().trim().min(2).max(50), occasion: z.string().trim().max(80).optional(), style: z.string().trim().max(80).optional(), colors: z.string().trim().max(200).optional(), budgetMin: z.coerce.number().int().min(0).optional(), budgetMax: z.coerce.number().int().min(0).optional(), requiredAt: z.string().optional(), fulfillment: z.enum(["delivery", "pickup"]), notes: z.string().trim().max(2000).optional() }).refine(value => value.budgetMin === undefined || value.budgetMax === undefined || value.budgetMin <= value.budgetMax, "Presupuesto inválido");

export async function createInquiry(formData: FormData) {
  const parsed = inquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/solicitar?error=datos");
  const value = parsed.data;
  const [existing] = await db.select().from(customers).where(or(eq(customers.phone, value.phone), value.email ? eq(customers.email, value.email) : eq(customers.phone, value.phone))).limit(1);
  const customer = existing ?? (await db.insert(customers).values({ name: value.name, email: value.email || null, phone: value.phone, contactPreference: "whatsapp" }).returning())[0];
  const reference = `OB-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const [inquiry] = await db.insert(inquiries).values({ reference, customerId: customer.id, type: value.type, occasion: value.occasion || null, style: value.style || null, colors: value.colors ? value.colors.split(",").map(item => item.trim()).filter(Boolean) : null, budgetMin: value.budgetMin, budgetMax: value.budgetMax, requiredAt: value.requiredAt ? new Date(`${value.requiredAt}T12:00:00-06:00`) : null, fulfillment: value.fulfillment, notes: value.notes || null }).returning();

  const files = formData.getAll("images").filter((item): item is File => item instanceof File && item.size > 0).slice(0, 3);
  for (const [index, file] of files.entries()) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5_000_000) continue;
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const blob = await uploadPrivateBlob(`inquiries/${randomUUID()}.${extension}`, file);
    const [asset] = await db.insert(mediaAssets).values({ provider: "cloudflare-r2-private", providerId: blob.pathname, url: blob.url, bytes: file.size, format: extension, alt: `Referencia privada ${index + 1}`, visibility: "private" }).returning();
    await db.insert(inquiryImages).values({ inquiryId: inquiry.id, mediaAssetId: asset.id, sortOrder: index });
  }
  try {
    await sendInquiryEmails({
      reference,
      name: value.name,
      email: value.email || undefined,
      phone: value.phone,
      type: value.type,
      occasion: value.occasion,
      style: value.style,
      colors: value.colors,
      budgetMin: value.budgetMin,
      budgetMax: value.budgetMax,
      requiredAt: value.requiredAt,
      fulfillment: value.fulfillment,
      notes: value.notes,
    });
  } catch (error) {
    console.error("No se pudieron enviar los correos de la solicitud", { reference, error });
  }
  redirect(`/solicitar/gracias?ref=${encodeURIComponent(reference)}`);
}
