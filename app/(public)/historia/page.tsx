import Image from "next/image";
import { getBrandingSettings } from "@/lib/branding";
import { getHomepageStory } from "@/lib/homepage-story";
import { getLocale } from "@/lib/i18n";
import { PublicShell } from "@/components/commerce/public-shell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nuestra historia", description: "Conoce la historia y la esencia floral de OrosBlooms.", alternates: { canonical: "/historia" } };

export default async function StoryPage() {
  const [locale, branding, story] = await Promise.all([getLocale(), getBrandingSettings(), getHomepageStory()]);
  const es = locale === "es";
  return <PublicShell><main className="commerce-wrap story-page"><header className="commerce-hero"><p className="commerce-kicker">{es ? "La esencia de OrosBlooms" : "The essence of OrosBlooms"}</p><h1>{es ? "Nuestra historia florece en cada detalle." : "Our story blooms in every detail."}</h1><p>{es ? "Conoce la intención detrás de cada arreglo, cada celebración y cada momento que acompañamos." : "Discover the intention behind every arrangement, celebration and moment we help bring to life."}</p></header><section className="editorial-split story-page-content"><div className="editorial-image"><Image src={story.image} alt={es ? branding.heroImageAltEs : branding.heroImageAltEn} fill priority/></div><div className="editorial-copy"><p className="commerce-kicker">{es ? "Más que flores" : "More than flowers"}</p><h2>{es ? story.titleEs : story.titleEn}</h2><p>{es ? story.subtitleEs : story.subtitleEn}</p><p>{es ? "Escuchamos la historia detrás de cada pedido y cuidamos la paleta, la textura y la escala para que el resultado se sienta verdaderamente personal." : "We listen to the story behind every order and carefully shape the palette, texture and scale so the result feels truly personal."}</p><a className="commerce-primary" href="/solicitar">{es ? "Cuéntanos tu idea" : "Tell us your idea"}</a></div></section></main></PublicShell>;
}
