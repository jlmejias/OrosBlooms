import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { homepageSections } from "@/db/schema";
import { homepageSectionDefaults } from "@/lib/homepage";

export async function getHomepageStory() {
  const [row] = await db.select({ content: homepageSections.content }).from(homepageSections).where(eq(homepageSections.key, "story")).orderBy(asc(homepageSections.sortOrder)).limit(1);
  const content = row?.content as Record<string, unknown> | undefined;
  const fallback = homepageSectionDefaults.story;
  const images = content?.images;
  return { titleEs: String(content?.titleEs || fallback.titleEs), titleEn: String(content?.titleEn || fallback.titleEn), subtitleEs: String(content?.subtitleEs || fallback.subtitleEs), subtitleEn: String(content?.subtitleEn || fallback.subtitleEn), image: Array.isArray(images) && typeof images[0] === "string" && images[0] ? images[0] : fallback.images[0] };
}
