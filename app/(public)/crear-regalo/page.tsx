import type { Metadata } from "next";
import { GiftBuilder } from "@/components/commerce/gift-builder";
import { PublicShell } from "@/components/commerce/public-shell";
import { listGiftProducts, listProducts } from "@/services/catalog";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Crear un regalo", description: "Crea un regalo floral paso a paso con complementos y dedicatoria.", alternates: { canonical: "/crear-regalo" } };

export default async function CreateGiftPage() {
  const locale=await getLocale();const es=locale==="es";
  const [flowers, complements] = await Promise.all([listGiftProducts(), listProducts({ type: "complement" })]);
  return <PublicShell><div className="commerce-wrap"><header className="commerce-hero"><p className="commerce-kicker">{es?"Crear un regalo":"Create a gift"}</p><h1>{es?"Hazlo personal, paso a paso.":"Make it personal, step by step."}</h1><p>{es?"Elige flores, tamaño, estilo, complementos y la forma de recibirlo.":"Choose flowers, size, style, extras and how you would like to receive it."}</p></header><GiftBuilder flowers={flowers} complements={complements} locale={locale}/></div></PublicShell>;
}
