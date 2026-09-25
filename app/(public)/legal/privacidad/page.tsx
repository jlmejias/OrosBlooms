import type { Metadata } from "next";
import { PublicShell } from "@/components/commerce/public-shell";
import { getBusinessSettings } from "@/lib/business";
import { getLocale } from "@/lib/i18n";
import { getSeoPolicies } from "@/lib/seo-policies";
export const metadata: Metadata = { title: "Privacidad", alternates: { canonical: "/legal/privacidad" } };
export default async function PrivacyPage() { const[business,seo,locale]=await Promise.all([getBusinessSettings(),getSeoPolicies(),getLocale()]);const es=locale==="es";const custom=es?seo.privacyEs:seo.privacyEn;return <PublicShell><article className="commerce-wrap legal-copy"><p className="commerce-kicker">Legal</p><h1>{es?"Privacidad.":"Privacy."}</h1>{custom?<p style={{whiteSpace:"pre-wrap"}}>{custom}</p>:<><p>{es?"OrosBlooms utiliza la información enviada en solicitudes exclusivamente para responder, preparar cotizaciones y coordinar servicios.":"OrosBlooms uses information submitted in requests solely to respond, prepare quotes, and coordinate services."}</p><h2>{es?"Conservación y derechos":"Retention and rights"}</h2><p>{es?business.privacyRetentionEs:business.privacyRetentionEn}</p></>}<p>{es?"Para consultas de privacidad escribe a":"For privacy questions, email"} <a href={`mailto:${business.email}`}>{business.email}</a>.</p></article></PublicShell>; }
