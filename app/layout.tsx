import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { getLocale } from "@/lib/i18n";
import { getBrandingSettings } from "@/lib/branding";
import { getSeoPolicies } from "@/lib/seo-policies";
import { NavigationFeedback } from "@/components/shared/navigation-feedback";
import "./globals.css";

const baseMetadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "OrosBlooms", template: "%s | OrosBlooms" },
  description: "Discover luxury flower arrangements, bloom boxes, and personalized gifts for every occasion.",
  applicationName: "OrosBlooms",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "OrosBlooms",
    title: "OrosBlooms",
    description: "Discover luxury flower arrangements, bloom boxes, and personalized gifts for every occasion.",
    images: [{ url: "/home-hero.webp", alt: "OrosBlooms luxury floral design" }],
  },
  twitter: { card: "summary_large_image", title: "OrosBlooms", description: "Discover luxury flower arrangements, bloom boxes, and personalized gifts for every occasion.", images: ["/home-hero.webp"] },
  robots: { index: true, follow: true },
};

export async function generateMetadata(): Promise<Metadata> {
  const [branding, seo, locale] = await Promise.all([getBrandingSettings(), getSeoPolicies(), getLocale()]);
  const isSpanish = locale === "es";
  const title = isSpanish ? seo.siteTitleEs : seo.siteTitleEn;
  const description = isSpanish ? seo.descriptionEs : seo.descriptionEn;

  return {
    ...baseMetadata,
    description,
    applicationName: branding.brandName,
    title: { default: title, template: `%s | ${branding.brandName}` },
    icons: {
      icon: [{ url: branding.faviconUrl || "/orosblooms-favicon.png", type: "image/png" }],
      shortcut: branding.faviconUrl || "/orosblooms-favicon.png",
      apple: branding.faviconUrl || "/orosblooms-favicon.png",
    },
    openGraph: {
      ...baseMetadata.openGraph,
      locale: isSpanish ? "es_CR" : "en_US",
      description,
      siteName: branding.brandName,
      title,
      images: [{ url: branding.heroImageUrl, alt: isSpanish ? branding.heroImageAltEs : branding.heroImageAltEn }],
    },
    twitter: { ...baseMetadata.twitter, description, title, images: [branding.heroImageUrl] },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale=await getLocale();
  return <html lang={locale} data-scroll-behavior="smooth"><body><NavigationFeedback/>{children}</body></html>;
}
