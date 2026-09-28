import type { Metadata } from "next";
import { PublicShell } from "@/components/commerce/public-shell";
import { getBusinessSettings } from "@/lib/business";
import { getLocale } from "@/lib/i18n";
import { getSeoPolicies } from "@/lib/seo-policies";

export const metadata: Metadata = { title: "Privacidad", alternates: { canonical: "/legal/privacidad" } };

export default async function PrivacyPage() {
  const [business, seo, locale] = await Promise.all([getBusinessSettings(), getSeoPolicies(), getLocale()]);
  const es = locale === "es";
  const custom = es ? seo.privacyEs : seo.privacyEn;
  const analyticsText = es
    ? "Para conocer el uso del sitio, registramos las páginas visitadas, ciudad, región y país aproximados cuando el proveedor de hosting los proporciona, y un identificador aleatorio protegido con hash. No guardamos dirección IP, nombre, correo, teléfono ni información del navegador. El identificador se conserva en una cookie técnica por hasta 30 días para estimar visitantes únicos."
    : "To understand site usage, we record visited pages, approximate city, region, and country when our hosting provider makes them available, and a random identifier protected with a hash. We do not store IP address, name, email, phone number, or browser information. The identifier is kept in a technical cookie for up to 30 days to estimate unique visitors.";

  return <PublicShell><article className="commerce-wrap legal-copy">
    <p className="commerce-kicker">Legal</p>
    <h1>{es ? "Privacidad." : "Privacy."}</h1>
    {custom ? <p style={{ whiteSpace: "pre-wrap" }}>{custom}</p> : <>
      <p>{es ? "OrosBlooms utiliza la información enviada en solicitudes exclusivamente para responder, preparar cotizaciones y coordinar servicios." : "OrosBlooms uses information submitted in requests solely to respond, prepare quotes, and coordinate services."}</p>
      <h2>{es ? "Conservación y derechos" : "Retention and rights"}</h2>
      <p>{es ? business.privacyRetentionEs : business.privacyRetentionEn}</p>
    </>}
    <h2>{es ? "Analíticas anónimas" : "Anonymous analytics"}</h2>
    <p>{analyticsText}</p>
    <p>{es ? "Para consultas de privacidad escribe a" : "For privacy questions, email"} <a href={`mailto:${business.email}`}>{business.email}</a>.</p>
  </article></PublicShell>;
}
