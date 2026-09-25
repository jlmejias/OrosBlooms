import { HomeHero } from "@/components/public/home-hero";
import { FeaturedProductsSection, GiftAddonsSection, HomeCategories, HomeStory } from "@/components/public/home-sections";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { homepageSections } from "@/db/schema";
import { type HomepageSectionKey } from "@/lib/homepage";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { getBrandingSettings } from "@/lib/branding";
import { getHeroCopy } from "@/lib/hero-copy";
import { listProducts } from "@/services/catalog";

export const metadata: Metadata = { title: "Flores para cada historia", alternates: { canonical: "/" } };

export default async function HomePage() {
  const [locale, branding, heroCopy, configured, catalogProducts] = await Promise.all([
    getLocale(),
    getBrandingSettings(),
    getHeroCopy(),
    db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder)),
    listProducts(),
  ]);
  const now = new Date();
  const settings = new Map(configured.map((item) => [item.key, item]));
  const visible = (key: HomepageSectionKey) => {
    const item = settings.get(key);
    return !item || (item.visible && (!item.startsAt || item.startsAt <= now) && (!item.endsAt || item.endsAt >= now));
  };
  const content = (key: HomepageSectionKey) => settings.get(key)?.content;

  return <div className="home-page"><main id="main-content"><HomeHero locale={locale} branding={branding} copy={heroCopy}/>
    {visible("categories") && <HomeCategories locale={locale} content={content("categories")}/>}
    {visible("featuredEditorial") && <FeaturedProductsSection locale={locale} content={content("featuredEditorial")} products={catalogProducts.filter(product=>product.featured).slice(0,4)}/>}
    {visible("giftAddons") && <GiftAddonsSection locale={locale} content={content("giftAddons")}/>}
    {visible("story") && <HomeStory locale={locale} content={content("story")}/>}
  </main></div>;
}
