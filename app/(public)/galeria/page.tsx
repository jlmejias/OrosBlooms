import { PublicShell } from "@/components/commerce/public-shell";
import { HomeGallery } from "@/components/public/home-sections";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { galleryImages, galleryItems, mediaAssets } from "@/db/schema";

export const metadata: Metadata = { title: "Galería floral", description: "Inspiración de arreglos, bodas y celebraciones creadas por OrosBlooms.", alternates: { canonical: "/galeria" } };

export default async function GalleryPage() {
  const locale=await getLocale();const es=locale==="es";
  const rows=await db.select({title:galleryItems.title,url:mediaAssets.url,alt:mediaAssets.alt}).from(galleryItems).innerJoin(galleryImages,eq(galleryImages.galleryItemId,galleryItems.id)).innerJoin(mediaAssets,eq(galleryImages.mediaAssetId,mediaAssets.id)).where(eq(galleryItems.visible,true)).orderBy(asc(galleryItems.sortOrder),asc(galleryImages.sortOrder));
  const items=rows.map(row=>({url:row.url,alt:row.alt||row.title}));
  return <PublicShell><div className="commerce-wrap"><header className="commerce-hero"><p className="commerce-kicker">{es?"Galería":"Gallery"}</p><h1>{es?"Historias que ya florecieron.":"Stories that have already bloomed."}</h1><p>{es?"Una mirada a arreglos, celebraciones y momentos creados con intención.":"A look at arrangements, celebrations and moments created with intention."}</p></header></div><HomeGallery locale={locale} items={items}/></PublicShell>;
}
