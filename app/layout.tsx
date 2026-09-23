import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { getLocale } from "@/lib/i18n";
import { getBrandingSettings } from "@/lib/branding";
import { getSeoPolicies } from "@/lib/seo-policies";
import { FormExperience } from "@/components/shared/form-experience";
import { FormPendingFeedback } from "@/components/shared/form-pending-feedback";
import { NavigationFeedback } from "@/components/shared/navigation-feedback";
import "./globals.css";

const baseMetadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "OrosBlooms", template: "%s | OrosBlooms" },
  description: "Diseño floral para momentos que se recuerdan.",
  applicationName: "OrosBlooms",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: "OrosBlooms",
    title: "OrosBlooms",
    description: "Diseño floral para momentos que se recuerdan.",
    images: [{ url: "/home-hero.webp", alt: "Diseño floral OrosBlooms" }],
  },
  twitter: { card: "summary_large_image", title: "OrosBlooms", description: "Diseño floral para momentos que se recuerdan.", images: ["/home-hero.webp"] },
  robots: { index: true, follow: true },
};

export async function generateMetadata():Promise<Metadata>{const[branding,seo,locale]=await Promise.all([getBrandingSettings(),getSeoPolicies(),getLocale()]);const title=locale==="es"?seo.siteTitleEs:seo.siteTitleEn;const description=locale==="es"?seo.descriptionEs:seo.descriptionEn;return{...baseMetadata,description,applicationName:branding.brandName,title:{default:title,template:`%s | ${branding.brandName}`},icons:{icon:branding.faviconUrl},openGraph:{...baseMetadata.openGraph,description,siteName:branding.brandName,title,images:[{url:branding.heroImageUrl,alt:branding.heroImageAltEs}]},twitter:{...baseMetadata.twitter,description,title,images:[branding.heroImageUrl]}}}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale=await getLocale();
  return <html lang={locale} data-scroll-behavior="smooth"><body><NavigationFeedback/><FormExperience/><FormPendingFeedback/>{children}</body></html>;
}
