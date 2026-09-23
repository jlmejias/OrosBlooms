import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
export type SeoPolicies={siteTitleEs:string;siteTitleEn:string;descriptionEs:string;descriptionEn:string;privacyEs:string;privacyEn:string;termsEs:string;termsEn:string};
export const defaultSeoPolicies:SeoPolicies={siteTitleEs:"OrosBlooms",siteTitleEn:"OrosBlooms",descriptionEs:"Diseño floral para momentos que se recuerdan.",descriptionEn:"Floral design for moments worth remembering.",privacyEs:"",privacyEn:"",termsEs:"",termsEn:""};
export const getSeoPolicies=cache(async()=>{const[row]=await db.select({value:siteSettings.value}).from(siteSettings).where(eq(siteSettings.key,"seo-policies")).limit(1);return{...defaultSeoPolicies,...(row?.value as Partial<SeoPolicies>|undefined)}});
