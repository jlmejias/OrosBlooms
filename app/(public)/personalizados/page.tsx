import { PublicShell } from "@/components/commerce/public-shell";
import { HomePersonalized } from "@/components/public/home-sections";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { getStandalonePageContent } from "@/lib/service-content";

export const metadata: Metadata = { title: "Detalles personalizados", description: "Detalles personalizados que acompañan tus flores y hacen único cada regalo.", alternates: { canonical: "/personalizados" } };

export default async function PersonalizedPage() {
  const [locale,content]=await Promise.all([getLocale(),getStandalonePageContent("personalizados")]);const es=locale==="es";const page=content.page;
  return <PublicShell><div className="commerce-wrap compact-page"><header className="commerce-hero"><p className="commerce-kicker">{es?page.kickerEs:page.kickerEn}</p><h1>{es?page.titleEs:page.titleEn}</h1><p>{es?page.descriptionEs:page.descriptionEn}</p></header></div><HomePersonalized locale={locale} content={{...page,images:content.images}}/></PublicShell>;
}
