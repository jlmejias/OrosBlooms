import type { Metadata } from "next"; import { PublicShell } from "@/components/commerce/public-shell"; import { ServicePageLayout } from "@/components/public/service-page-layout";
import { getLocale } from "@/lib/i18n";
import { getServiceContent } from "@/lib/service-content";
import { defaultServicePageContent } from "@/lib/service-page";
export const metadata: Metadata = { title: "Flores para bodas", description: "Diseño floral integral para bodas en Costa Rica.", alternates: { canonical: "/bodas" } };
export default async function WeddingsPage(){const[locale,service]=await Promise.all([getLocale(),getServiceContent("bodas")]);const page=service?.page??defaultServicePageContent("bodas");return <PublicShell><div className="commerce-wrap service-page"><ServicePageLayout variant="weddings" locale={locale} page={page} images={service?.images??[]} ctaHref="/solicitar?tipo=boda"/></div></PublicShell>}
