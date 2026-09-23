import { StoreProvider } from "@/components/commerce/store-provider";
import { HomeHeader, MobileBottomNav } from "@/components/public/home-header";
import { HomeFooter } from "@/components/public/home-sections";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { absoluteUrl, jsonLd } from "@/lib/site";
import { getBusinessSettings } from "@/lib/business";
import { getLocale } from "@/lib/i18n";
import { getBrandingSettings } from "@/lib/branding";
import "./commerce.css";
import "./commerce-advanced.css";
import "./home.css";
import "./home-custom.css";

export default async function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [business,locale,branding] = await Promise.all([getBusinessSettings(),getLocale(),getBrandingSettings()]);
  const organization = { "@context": "https://schema.org", "@type": "Florist", name: branding.brandName, url: absoluteUrl(), logo: absoluteUrl(branding.logoUrl), image: absoluteUrl(branding.heroImageUrl), description: "Diseño floral para momentos que se recuerdan.", email: business.email, telephone: business.phone, areaServed: { "@type": "City", name: business.deliveryArea } };
  const theme={"--background":branding.backgroundColor,"--foreground":branding.foregroundColor,"--olive":branding.primaryColor,"--olive-hover":branding.primaryColor,"--burgundy":branding.accentColor,"--focus":branding.accentColor,"--blush-soft":branding.softAccentColor} as React.CSSProperties;
  return <StoreProvider><div className="public-site" style={theme}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organization) }} /><ScrollReveal /><a className="skip-link" href="#main-content">{locale==="es"?"Saltar al contenido":"Skip to content"}</a><HomeHeader locale={locale} logoUrl={branding.logoUrl} logoAlt={locale==="es"?branding.logoAltEs:branding.logoAltEn}/>{children}<HomeFooter locale={locale}/><MobileBottomNav locale={locale}/></div></StoreProvider>;
}
