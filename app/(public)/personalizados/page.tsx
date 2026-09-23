import { PublicShell } from "@/components/commerce/public-shell";
import { HomePersonalized } from "@/components/public/home-sections";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Detalles personalizados", description: "Detalles personalizados que acompañan tus flores y hacen único cada regalo.", alternates: { canonical: "/personalizados" } };

export default async function PersonalizedPage() {
  const locale=await getLocale();const es=locale==="es";
  return <PublicShell><div className="commerce-wrap"><header className="commerce-hero"><p className="commerce-kicker">{es?"Personalizados":"Personalized"}</p><h1>{es?"Detalles hechos para tu historia.":"Details made for your story."}</h1><p>{es?"Acompaña tus flores con piezas pensadas especialmente para esa persona.":"Pair your flowers with pieces created especially for that person."}</p></header></div><HomePersonalized locale={locale}/></PublicShell>;
}
