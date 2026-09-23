import type { Metadata } from "next";
import { PublicShell } from "@/components/commerce/public-shell";
import { getBusinessSettings } from "@/lib/business";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Información del negocio", description: "Contacto, horarios y entregas de OrosBlooms.", alternates: { canonical: "/informacion" } };

export default async function InformationPage() {
  const business=await getBusinessSettings();
  const es=(await getLocale())==="es";
  return <PublicShell><div className="commerce-wrap"><header className="commerce-hero"><p className="commerce-kicker">{es?"Información":"Information"}</p><h1>{es?"Estamos para ayudarte.":"We are here to help."}</h1><p>{es?"Consulta nuestros canales, horarios y condiciones generales de entrega.":"Find our contact channels, hours and general delivery terms."}</p></header><div className="information-grid"><section><h2>{es?"Contacto":"Contact"}</h2><a href={`mailto:${business.email}`}>{business.email}</a><a href={`tel:${business.phone}`}>{business.phone}</a><a href={`https://wa.me/${business.whatsapp.replace(/\D/g,"")}`}>WhatsApp</a></section><section><h2>{es?"Horario":"Hours"}</h2><p>{es?business.hoursEs:business.hoursEn}</p></section><section><h2>{es?"Entregas":"Delivery"}</h2><p>{business.deliveryArea}</p><p>{es?business.deliveryNoticeEs:business.deliveryNoticeEn}</p></section><section><h2>{es?"Condiciones":"Terms"}</h2><p>{es?`Para confirmar un arreglo se solicita un adelanto del ${business.depositPercent}%.`:`A ${business.depositPercent}% deposit is required to confirm an arrangement.`}</p><p>{es?business.cancellationPolicyEs:business.cancellationPolicyEn}</p></section><section><h2>{es?"Redes":"Social media"}</h2><a href={business.instagram}>Instagram</a><a href={business.facebook}>Facebook</a></section></div></div></PublicShell>;
}
