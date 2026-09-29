import type { Metadata } from "next"; import { PublicShell } from "@/components/commerce/public-shell"; import { ServicePageLayout } from "@/components/public/service-page-layout";
import { getLocale } from "@/lib/i18n";
import { getServiceContent } from "@/lib/service-content";
import { defaultServicePageContent } from "@/lib/service-page";
export const metadata: Metadata = { title: "Flores para eventos", description: "Diseño floral para celebraciones y eventos en Costa Rica.", alternates: { canonical: "/eventos" } };
export default async function EventsPage(){const[locale,service]=await Promise.all([getLocale(),getServiceContent("eventos")]);const page=service?.page??defaultServicePageContent("eventos");return <PublicShell><div className="commerce-wrap service-page"><ServicePageLayout variant="events" locale={locale} page={page} images={service?.images??[]} ctaHref="/solicitar?tipo=evento"/></div></PublicShell>}
