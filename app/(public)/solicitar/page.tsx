import type { Metadata } from "next";
import { PublicShell } from "@/components/commerce/public-shell";
import { stringValue } from "@/lib/format";
import { getLocale } from "@/lib/i18n";
import { createInquiry } from "../actions";

export const metadata: Metadata = {
  title: "Request a floral design",
  description: "Tell us what you are celebrating and receive a personalized floral proposal.",
  alternates: { canonical: "/solicitar" },
};

export default async function RequestPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, locale] = await Promise.all([searchParams, getLocale()]);
  const es = locale === "es";
  return <PublicShell><div className="commerce-wrap">
    <header className="commerce-hero">
      <p className="commerce-kicker">{es ? "Solicitud personalizada" : "Custom request"}</p>
      <h1>{es ? "Cuéntanos qué quieres celebrar." : "Tell us what you are celebrating."}</h1>
      <p>{es ? "Completa la información disponible. Te contactaremos para afinar el diseño y preparar una cotización." : "Share the details you have. We will contact you to refine the design and prepare a quote."}</p>
      {params.error && <p role="alert">{es ? "Revisa los campos señalados e inténtalo nuevamente." : "Review the highlighted fields and try again."}</p>}
    </header>
    <form action={createInquiry} className="commerce-form">
      <label>{es ? "Nombre" : "Name"}<input name="name" required minLength={2} placeholder={es ? "Tu nombre completo" : "Your full name"}/></label>
      <label>{es ? "Teléfono / WhatsApp" : "Phone / WhatsApp"}<input name="phone" type="tel" required minLength={7} placeholder={es ? "+506 8888 8888" : "+1 555 123 4567"}/></label>
      <label>{es ? "Correo" : "Email"}<input name="email" type="email" placeholder={es ? "nombre@correo.com" : "name@email.com"}/></label>
      <label>{es ? "Tipo" : "Type"}<select name="type" defaultValue={stringValue(params.tipo) || "arreglo"}><option value="arreglo">{es ? "Arreglo floral" : "Floral arrangement"}</option><option value="boda">{es ? "Boda" : "Wedding"}</option><option value="evento">{es ? "Evento" : "Event"}</option><option value="personalizado">{es ? "Diseño personalizado" : "Custom design"}</option></select></label>
      <label>{es ? "Ocasión" : "Occasion"}<input name="occasion" placeholder={es ? "Cumpleaños, aniversario..." : "Birthday, anniversary..."}/></label>
      <label>{es ? "Estilo" : "Style"}<input name="style" placeholder={es ? "Romántico, natural, moderno..." : "Romantic, natural, modern..."}/></label>
      <label className="form-wide">{es ? "Colores separados por coma" : "Colors separated by commas"}<input name="colors" placeholder={es ? "Rosado, crema, verde" : "Blush, cream, green"}/></label>
      <label>{es ? "Presupuesto mínimo" : "Minimum budget"}<input name="budgetMin" type="number" min="0" step="10" placeholder="0"/></label>
      <label>{es ? "Presupuesto máximo" : "Maximum budget"}<input name="budgetMax" type="number" min="0" step="10" placeholder="0"/></label>
      <label>{es ? "Fecha requerida" : "Required date"}<input name="requiredAt" type="date"/></label>
      <label>{es ? "Modalidad" : "Method"}<select name="fulfillment" defaultValue="delivery"><option value="delivery">{es ? "Entrega" : "Delivery"}</option><option value="pickup">{es ? "Retiro" : "Pickup"}</option></select></label>
      <label className="form-wide">{es ? "Referencias (máximo 3 imágenes, 5 MB cada una)" : "References (up to 3 images, 5 MB each)"}<input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple/></label>
      <label className="form-wide">{es ? "Cuéntanos los detalles" : "Tell us the details"}<textarea name="notes" maxLength={2000} placeholder={es ? "Describe tu idea, preferencias o cualquier detalle importante" : "Describe your idea, preferences, or any important details"}/></label>
      <button className="commerce-primary" type="submit">{es ? "Enviar solicitud" : "Send request"}</button>
    </form>
  </div></PublicShell>;
}
