import { CheckoutView } from "@/components/commerce/checkout-view";
import { PublicShell } from "@/components/commerce/public-shell";
import { getLocale } from "@/lib/i18n";

export default async function CheckoutPage() {
  const locale = await getLocale();
  return <PublicShell><div className="commerce-wrap"><header className="commerce-hero"><p className="commerce-kicker">{locale === "es" ? "Finalizar pedido" : "Checkout"}</p><h1>{locale === "es" ? "Pago y entrega." : "Payment and delivery."}</h1><p>{locale === "es" ? "Elige cómo recibir y pagar tu pedido." : "Choose how to receive and pay for your order."}</p></header><CheckoutView locale={locale}/></div></PublicShell>;
}
