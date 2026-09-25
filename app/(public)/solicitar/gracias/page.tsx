import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/commerce/public-shell";
import { stringValue } from "@/lib/format";
import { getLocale } from "@/lib/i18n";

export default async function ThanksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [p, locale] = await Promise.all([searchParams, getLocale()]);
  const reference = stringValue(p.ref);
  if (!reference) redirect("/solicitar");
  const es = locale === "es";
  return <PublicShell><div className="commerce-wrap"><header className="commerce-hero"><p className="commerce-kicker">{es ? "Solicitud recibida" : "Request received"}</p><h1>{es ? "Tu historia ya empezó a florecer." : "Your story has started to bloom."}</h1><p>{es ? "Guarda esta referencia:" : "Save this reference:"} <strong>{reference}</strong>. {es ? "Nos pondremos en contacto para continuar." : "We will contact you to continue."}</p><p><Link href="/flores">{es ? "Volver al catálogo" : "Back to the catalog"}</Link></p></header></div></PublicShell>;
}
