import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";

export type BusinessSettings = {
  email:string; phone:string; whatsapp:string; instagram:string; facebook:string;
  hours:string; hoursEn:string; hoursEs:string; deliveryArea:string;
  deliveryNotice:string; deliveryNoticeEn:string; deliveryNoticeEs:string;
  deliveryFee:number; depositPercent:number;
  cancellationPolicy:string; cancellationPolicyEn:string; cancellationPolicyEs:string;
  privacyRetention:string; privacyRetentionEn:string; privacyRetentionEs:string;
};

export const testBusinessSettings:BusinessSettings = {
  email:"hola@orosblooms.test", phone:"+1 (805) 555-0147", whatsapp:"18055550147",
  instagram:"https://example.com/orosblooms-instagram", facebook:"https://example.com/orosblooms-facebook",
  hours:"Lunes a sábado, 9:00 a. m. a 6:00 p. m. (horario de prueba)",
  hoursEn:"Monday through Saturday, 9:00 a.m. to 6:00 p.m. (sample hours)",
  hoursEs:"Lunes a sábado, 9:00 a. m. a 6:00 p. m. (horario de prueba)", deliveryArea:"Oxnard, California",
  deliveryNotice:"La disponibilidad y el costo de entrega se confirman al preparar la cotización.",
  deliveryNoticeEn:"Delivery availability and cost are confirmed when preparing your quote.",
  deliveryNoticeEs:"La disponibilidad y el costo de entrega se confirman al preparar la cotización.",
  deliveryFee:0, depositPercent:50,
  cancellationPolicy:"Política de cancelación y devoluciones pendiente de aprobación.",
  cancellationPolicyEn:"Cancellation and refund policy pending approval.",
  cancellationPolicyEs:"Política de cancelación y devoluciones pendiente de aprobación.",
  privacyRetention:"Plazo de conservación pendiente de aprobación.",
  privacyRetentionEn:"Data retention period pending approval.",
  privacyRetentionEs:"Plazo de conservación pendiente de aprobación.",
};

export const getBusinessSettings=cache(async():Promise<BusinessSettings>=>{const[row]=await db.select({value:siteSettings.value}).from(siteSettings).where(eq(siteSettings.key,"business")).limit(1);return{...testBusinessSettings,...(row?.value as Partial<BusinessSettings>|undefined)}});
