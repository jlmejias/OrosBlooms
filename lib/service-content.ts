import { eq, or } from "drizzle-orm";
import { db } from "@/db/client";
import { mediaAssets, services, siteSettings } from "@/db/schema";
import { defaultPageContent, type PageContent, type PageImage } from "@/lib/service-page";

type StoredPageContent = Partial<PageContent> & { images?: PageImage[] };

function imagesFor(content: StoredPageContent, fallback?: string | null) {
  return content.images?.filter(image => image && typeof image.url === "string") ?? (fallback ? [{ id: "legacy", url: fallback }] : []);
}

export async function getServiceContent(slug: "bodas" | "eventos") {
  const type = slug === "bodas" ? "wedding" : "event";
  const [rows, translationRows, legacyRows, pageRows] = await Promise.all([
    db.select({ id: services.id, name: services.name, description: services.description, imageUrl: mediaAssets.url })
      .from(services).leftJoin(mediaAssets, eq(services.imageId, mediaAssets.id))
      .where(or(eq(services.slug, slug), eq(services.type, type))).limit(1),
    db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "service-translations")).limit(1),
    db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "service-page-content")).limit(1),
    db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "page-content")).limit(1),
  ]);
  const service = rows[0];
  const translations = (translationRows[0]?.value ?? {}) as Record<string, { nameEn?: string; descriptionEn?: string }>;
  const legacy = (legacyRows[0]?.value ?? {}) as Record<string, StoredPageContent>;
  const pages = (pageRows[0]?.value ?? {}) as Record<string, StoredPageContent>;
  const translation = service ? translations[service.id] : undefined;
  const page = { ...defaultPageContent(slug), ...(service ? { titleEs: service.name, titleEn: translation?.nameEn || service.name, descriptionEs: service.description || "", descriptionEn: translation?.descriptionEn || service.description || "", ...legacy[service.id] } : {}), ...pages[slug] };
  return { ...(service ?? {}), translation, page, images: imagesFor(page, service?.imageUrl) };
}

export async function getStandalonePageContent(slug: "personalizados") {
  const [row] = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "page-content")).limit(1);
  const pages = (row?.value ?? {}) as Record<string, StoredPageContent>;
  const page = { ...defaultPageContent(slug), ...pages[slug] };
  return { page, images: imagesFor(page) };
}

export type ServiceImage = PageImage;
