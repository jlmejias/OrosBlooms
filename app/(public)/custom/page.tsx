import { PublicShell } from "@/components/commerce/public-shell";
import { ServicePageLayout } from "@/components/public/service-page-layout";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { getStandalonePageContent } from "@/lib/service-content";

export const metadata: Metadata = { title: "Detalles personalizados", description: "Detalles personalizados que acompañan tus flores y hacen único cada regalo.", alternates: { canonical: "/personalizados" } };

export default async function PersonalizedPage() {
  const [locale,content]=await Promise.all([getLocale(),getStandalonePageContent("personalizados")]);const es=locale==="es";const page=content.page;
  return <PublicShell><div className="commerce-wrap service-page"><ServicePageLayout variant="personalized" locale={locale} page={page} images={content.images} ctaHref="/crear-regalo"/></div></PublicShell>;
}
