"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { savePageContent } from "@/app/admin/actions";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import { pageFeatureIconOptions, pageSlugs } from "@/lib/service-page";

const field = z.string().trim().min(1).max(2000);
const featureField = z.string().trim().min(1).max(300);
const featureIcon = z.enum(pageFeatureIconOptions.map(option => option.value) as [string, ...string[]]);

function text(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

export async function savePageLayoutContent(form: FormData) {
  const pageKey = z.enum(pageSlugs).parse(text(form, "pageKey"));
  const layout = {
    heroAsideEs: field.parse(text(form, "heroAsideEs")),
    heroAsideEn: field.parse(text(form, "heroAsideEn")),
    detailKickerEs: field.parse(text(form, "detailKickerEs")),
    detailKickerEn: field.parse(text(form, "detailKickerEn")),
    secondaryCtaLabelEs: field.parse(text(form, "secondaryCtaLabelEs")),
    secondaryCtaLabelEn: field.parse(text(form, "secondaryCtaLabelEn")),
    features: [0, 1, 2].map(index => ({
      titleEs: featureField.parse(text(form, `feature${index}TitleEs`)),
      titleEn: featureField.parse(text(form, `feature${index}TitleEn`)),
      descriptionEs: field.parse(text(form, `feature${index}DescriptionEs`)),
      descriptionEn: field.parse(text(form, `feature${index}DescriptionEn`)),
      icon: featureIcon.parse(text(form, `feature${index}Icon`)),
    })),
  };

  await savePageContent(form);

  const [row] = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "page-content")).limit(1);
  const pages = (row?.value ?? {}) as Record<string, Record<string, unknown>>;
  await db.insert(siteSettings).values({ key: "page-content", value: { ...pages, [pageKey]: { ...pages[pageKey], ...layout } } }).onConflictDoUpdate({ target: siteSettings.key, set: { value: { ...pages, [pageKey]: { ...pages[pageKey], ...layout } }, updatedAt: new Date() } });
  for (const path of ["/weddings", "/events", "/custom", "/bodas", "/eventos", "/personalizados"]) revalidatePath(path);
}
