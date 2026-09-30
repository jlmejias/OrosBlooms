import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  combos, galleryImages, homepageSections, inquiryImages, mediaAssets,
  orders, productImages, services, siteSettings, testimonials,
} from "@/db/schema";
import { listPrivateBlobs, listPublicBlobs } from "@/lib/blob";

const managedVisuals = /^(?:(?:pages|gallery|homepage|products|combos|media|services|branding)\/.+|[a-f\d-]{36})\.(?:jpe?g|png|webp|mp4|webm)$/i;
const minimumAgeMs = 60 * 60 * 1000;

export async function mediaAssetIsInUse(asset: { id: string; url: string; providerId: string }) {
  const [products, gallery, inquiries, paymentProofs, serviceImages, testimonialImages, comboImages, sections, settings] = await Promise.all([
    db.select({ id: productImages.id }).from(productImages).where(eq(productImages.mediaAssetId, asset.id)).limit(1),
    db.select({ id: galleryImages.id }).from(galleryImages).where(eq(galleryImages.mediaAssetId, asset.id)).limit(1),
    db.select({ id: inquiryImages.id }).from(inquiryImages).where(eq(inquiryImages.mediaAssetId, asset.id)).limit(1),
    db.select({ id: orders.id }).from(orders).where(eq(orders.paymentProofAssetId, asset.id)).limit(1),
    db.select({ id: services.id }).from(services).where(eq(services.imageId, asset.id)).limit(1),
    db.select({ id: testimonials.id }).from(testimonials).where(eq(testimonials.imageId, asset.id)).limit(1),
    db.select({ url: combos.imageUrl }).from(combos).where(eq(combos.imageUrl, asset.url)).limit(1),
    db.select({ content: homepageSections.content }).from(homepageSections),
    db.select({ value: siteSettings.value }).from(siteSettings),
  ]);
  if ([products, gallery, inquiries, paymentProofs, serviceImages, testimonialImages, comboImages].some(rows => rows.length > 0)) return true;
  const json = JSON.stringify([...sections.map(row => row.content), ...settings.map(row => row.value)]);
  return json.includes(asset.url) || json.includes(asset.providerId);
}

export async function orphanedPublicBlobs() {
  const [files, assets, combosWithImages, sections, settings] = await Promise.all([
    listPublicBlobs(),
    db.select({ providerId: mediaAssets.providerId, url: mediaAssets.url }).from(mediaAssets),
    db.select({ imageUrl: combos.imageUrl }).from(combos),
    db.select({ content: homepageSections.content }).from(homepageSections),
    db.select({ value: siteSettings.value }).from(siteSettings),
  ]);
  const registered = new Set(assets.map(asset => asset.providerId));
  const referencedUrls = JSON.stringify([
    ...assets.map(asset => asset.url),
    ...combosWithImages.map(combo => combo.imageUrl),
    ...sections.map(section => section.content),
    ...settings.map(setting => setting.value),
  ]);
  const cutoff = Date.now() - minimumAgeMs;
  return files
    .filter(file => managedVisuals.test(file.pathname))
    .filter(file => file.modifiedAt.getTime() < cutoff)
    .filter(file => !registered.has(file.pathname))
    .filter(file => !referencedUrls.includes(`/uploads/${file.pathname}`) && !referencedUrls.includes(file.pathname))
    .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
}

export async function orphanedPrivateBlobs() {
  const [files, assets] = await Promise.all([
    listPrivateBlobs(),
    db.select({ providerId: mediaAssets.providerId }).from(mediaAssets),
  ]);
  const registered = new Set(assets.map(asset => asset.providerId));
  const cutoff = Date.now() - minimumAgeMs;
  return files
    .filter(file => /^(payments|inquiries)\/.+\.(?:jpe?g|png|webp)$/i.test(file.pathname))
    .filter(file => file.modifiedAt.getTime() < cutoff)
    .filter(file => !registered.has(file.pathname))
    .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
}
