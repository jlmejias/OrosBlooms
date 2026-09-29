import { PublicShell } from "@/components/commerce/public-shell";
import { PortfolioGallery } from "@/components/public/portfolio-gallery";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { galleryImages, galleryItems, mediaAssets } from "@/db/schema";

export const metadata: Metadata = { title: "Galería floral", description: "Inspiración de arreglos, bodas y celebraciones creadas por OrosBlooms.", alternates: { canonical: "/gallery" } };

export default async function GalleryPage() {
  const locale=await getLocale();const es=locale==="es";
  const rows=await db.select({id:galleryImages.id,title:galleryItems.title,description:galleryItems.description,category:galleryItems.galleryCategory,featured:galleryItems.featured,url:mediaAssets.url,alt:mediaAssets.alt}).from(galleryItems).innerJoin(galleryImages,eq(galleryImages.galleryItemId,galleryItems.id)).innerJoin(mediaAssets,eq(galleryImages.mediaAssetId,mediaAssets.id)).where(eq(galleryItems.visible,true)).orderBy(desc(galleryItems.featured),asc(galleryItems.sortOrder),asc(galleryImages.sortOrder));
  const items=rows.map(row=>({id:row.id,title:row.title,description:row.description||"",category:row.category as "flores"|"bodas"|"eventos"|"personalizados",featured:row.featured,url:row.url,alt:row.alt||row.title}));
  return <PublicShell><div className="commerce-wrap compact-page"><header className="commerce-hero"><p className="commerce-kicker">{es?"Galería":"Gallery"}</p><h1>{es?"Historias que ya florecieron.":"Stories that have already bloomed."}</h1><p>{es?"Arreglos, bodas, eventos y detalles creados con intención para momentos únicos.":"Arrangements, weddings, events and details created with intention for unique moments."}</p></header><PortfolioGallery locale={locale} items={items}/></div></PublicShell>;
}
