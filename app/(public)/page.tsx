import { HomeHero } from "@/components/public/home-hero";
import { HomeCustomSection } from "@/components/public/home-custom-section";
import { FeaturedProductsSection, GiftAddonsSection, HomeCategories, HomeEvents, HomeFeatured, HomeFinalCta, HomeGallery, HomePersonalized, HomeStory, HomeTestimonial, HomeWedding } from "@/components/public/home-sections";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { homepageSections } from "@/db/schema";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { getBrandingSettings } from "@/lib/branding";

export const metadata: Metadata = { title: "Flores para cada historia", alternates: { canonical: "/" } };

export default async function HomePage() {
  const locale=await getLocale();
  const branding=await getBrandingSettings();
  const now = new Date();
  const configured = await db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder));
  const registry: Record<string, React.ReactNode> = { categories: <HomeCategories locale={locale}/>, featuredEditorial: <FeaturedProductsSection locale={locale}/>, giftAddons: <GiftAddonsSection locale={locale}/>, story: <HomeStory locale={locale}/>, featured: <HomeFeatured locale={locale}/>, wedding: <HomeWedding locale={locale}/>, events: <HomeEvents locale={locale}/>, personalized: <HomePersonalized locale={locale}/>, gallery: <HomeGallery locale={locale}/>, testimonial: <HomeTestimonial locale={locale}/>, cta: <HomeFinalCta locale={locale}/> };
  const defaults = ["categories","story","featured","wedding","events","personalized","gallery","testimonial","cta"];
  const active=(item:typeof configured[number])=>item.visible&&(!item.startsAt||item.startsAt<=now)&&(!item.endsAt||item.endsAt>=now);
  const byKey=new Map(configured.map(item=>[item.key,item]));
  const ordered=[...configured.filter(active).map(item=>item.key),...defaults.filter(key=>!byKey.has(key))];
  const insertionPoint=Math.max(0,ordered.indexOf("categories")+1);ordered.splice(insertionPoint,0,"featuredEditorial","giftAddons");
  return <div className="home-page"><main id="main-content"><HomeHero locale={locale} branding={branding}/>{ordered.map(key=>{const item=byKey.get(key);const hasCustomContent=Boolean(item&&(item.content.titleEs||item.content.titleEn));return <div key={key}>{hasCustomContent?<HomeCustomSection id={key} content={item!.content} locale={locale}/>:registry[key]??(item?<HomeCustomSection id={key} content={item.content} locale={locale}/>:null)}</div>})}</main></div>;
}
