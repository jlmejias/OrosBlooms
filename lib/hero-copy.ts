import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";

export type HeroCopy = {
  eyebrowEs:string; eyebrowEn:string;
  titleEs:string; titleEn:string;
  emphasisEs:string; emphasisEn:string;
  descriptionEs:string; descriptionEn:string;
  primaryLabelEs:string; primaryLabelEn:string; primaryHref:string;
  secondaryLabelEs:string; secondaryLabelEn:string; secondaryHref:string;
  asideEs:string; asideEn:string;
};

export const defaultHeroCopy:HeroCopy={
  eyebrowEs:"Flores para cada historia",eyebrowEn:"Flowers for every story",
  titleEs:"Diseños que",titleEn:"Designs that",emphasisEs:"hacen sentir.",emphasisEn:"make you feel.",
  descriptionEs:"Arreglos únicos para momentos reales.\nFlores frescas, emociones duraderas.",descriptionEn:"Unique arrangements for real moments.\nFresh flowers, lasting emotions.",
  primaryLabelEs:"Explorar diseños",primaryLabelEn:"Explore designs",primaryHref:"/flores",
  secondaryLabelEs:"Nuestra historia",secondaryLabelEn:"Our story",secondaryHref:"#historia",
  asideEs:"Más que flores, momentos.",asideEn:"More than flowers, moments.",
};

export const getHeroCopy=cache(async():Promise<HeroCopy>=>{const[row]=await db.select({value:siteSettings.value}).from(siteSettings).where(eq(siteSettings.key,"hero-copy")).limit(1);return{...defaultHeroCopy,...(row?.value as Partial<HeroCopy>|undefined)}});
