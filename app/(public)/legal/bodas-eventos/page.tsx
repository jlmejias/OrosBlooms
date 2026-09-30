import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/commerce/public-shell";
import { getLocale } from "@/lib/i18n";
import { getSeoPolicies, resolveLegalPolicy } from "@/lib/seo-policies";

export const metadata: Metadata = { title: "Bodas y eventos", alternates: { canonical: "/legal/bodas-eventos" } };

export default async function WeddingsEventsPolicyPage() {
  const [settings, locale] = await Promise.all([getSeoPolicies(), getLocale()]);
  const policy = resolveLegalPolicy(settings, "weddingsEvents");
  if (!policy.published) notFound();
  const es = locale === "es";
  return <PublicShell><article className="commerce-wrap legal-copy">
    <p className="commerce-kicker">Legal</p>
    <h1>{es ? policy.titleEs : policy.titleEn}</h1>
    <p><small>{es ? "Última actualización" : "Last updated"}: {policy.updatedAt || "[POR DEFINIR]"}</small></p>
    {(es ? policy.contentEs : policy.contentEn).split(/\n\s*\n/).map((paragraph, index) => <p key={index} style={{ whiteSpace: "pre-line" }}>{paragraph}</p>)}
  </article></PublicShell>;
}
