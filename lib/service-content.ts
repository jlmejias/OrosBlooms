import { eq, or } from "drizzle-orm";
import { db } from "@/db/client";
import { mediaAssets, services, siteSettings } from "@/db/schema";

export async function getServiceContent(slug: "bodas" | "eventos") {
  const type = slug === "bodas" ? "wedding" : "event";
  const [rows, translationRows] = await Promise.all([
    db.select({ id: services.id, name: services.name, description: services.description, imageUrl: mediaAssets.url })
      .from(services)
      .leftJoin(mediaAssets, eq(services.imageId, mediaAssets.id))
      .where(or(eq(services.slug, slug), eq(services.type, type)))
      .limit(1),
    db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "service-translations")).limit(1),
  ]);
  const service = rows[0];
  const translations = (translationRows[0]?.value ?? {}) as Record<string, { nameEn?: string; descriptionEn?: string }>;
  return service ? { ...service, translation: translations[service.id] } : null;
}
