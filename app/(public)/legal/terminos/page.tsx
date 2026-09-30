import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/commerce/public-shell";
import { getLocale } from "@/lib/i18n";
import { getSeoPolicies, resolveLegalPolicy } from "@/lib/seo-policies";

export const metadata: Metadata = { title: "Términos y condiciones", alternates: { canonical: "/legal/terminos" } };

export default async function TermsPage() {
  const [settings, locale] = await Promise.all([getSeoPolicies(), getLocale()]);
  const policy = resolveLegalPolicy(settings, "terms");
  if (!policy.published) notFound();
  const es = locale === "es";
  const substitution = resolveLegalPolicy(settings, "floralSubstitution");
  const events = resolveLegalPolicy(settings, "weddingsEvents");
  const content = es ? policy.contentEs : policy.contentEn;
  return <PublicShell><article className="commerce-wrap legal-copy">
    <p className="commerce-kicker">Legal</p>
    <h1>{es ? policy.titleEs : policy.titleEn}</h1>
    <p><small>{es ? "Última actualización" : "Last updated"}: {policy.updatedAt || "[POR DEFINIR]"}</small></p>
    {content.split(/\n\s*\n/).map((paragraph, index) => <p key={index} style={{ whiteSpace: "pre-line" }}>{paragraph}</p>)}
    {substitution.published && <p><Link href="/legal/sustitucion-floral">{es ? substitution.titleEs : substitution.titleEn} →</Link></p>}
    {events.published && <p><Link href="/legal/bodas-eventos">{es ? events.titleEs : events.titleEn} →</Link></p>}
  </article></PublicShell>;
}
