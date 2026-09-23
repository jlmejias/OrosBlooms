import { PublicShell } from "@/components/commerce/public-shell";
import { HomeGallery } from "@/components/public/home-sections";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Galería floral", description: "Inspiración de arreglos, bodas y celebraciones creadas por OrosBlooms.", alternates: { canonical: "/galeria" } };

export default async function GalleryPage() {
  const locale=await getLocale();const es=locale==="es";
  return <PublicShell><div className="commerce-wrap"><header className="commerce-hero"><p className="commerce-kicker">{es?"Galería":"Gallery"}</p><h1>{es?"Historias que ya florecieron.":"Stories that have already bloomed."}</h1><p>{es?"Una mirada a arreglos, celebraciones y momentos creados con intención.":"A look at arrangements, celebrations and moments created with intention."}</p></header></div><HomeGallery locale={locale}/></PublicShell>;
}
