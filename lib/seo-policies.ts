import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
export type SeoPolicies={siteTitleEs:string;siteTitleEn:string;descriptionEs:string;descriptionEn:string;privacyEs:string;privacyEn:string;termsEs:string;termsEn:string};
export const defaultSeoPolicies:SeoPolicies={siteTitleEs:"OrosBlooms | Flores y diseños para cada ocasión",siteTitleEn:"OrosBlooms | Luxury Flowers, Gift Boxes & Floral Designs",descriptionEs:"Arreglos florales, cajas de flores y regalos personalizados para cada ocasión.",descriptionEn:"Discover luxury flower arrangements, bloom boxes, and personalized gifts for every occasion. Thoughtfully designed by OrosBlooms.",privacyEs:"",privacyEn:"",termsEs:"",termsEn:""};
export const getSeoPolicies=cache(async()=>{const[row]=await db.select({value:siteSettings.value}).from(siteSettings).where(eq(siteSettings.key,"seo-policies")).limit(1);return{...defaultSeoPolicies,...(row?.value as Partial<SeoPolicies>|undefined)}});
