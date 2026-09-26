import { CheckoutView } from "@/components/commerce/checkout-view";
import { PublicShell } from "@/components/commerce/public-shell";
import { getLocale } from "@/lib/i18n";

export default async function CheckoutPage() {
  const locale = await getLocale();
  return <PublicShell><div className="commerce-wrap checkout-wrap"><header className="checkout-hero"><p className="checkout-breadcrumb">{locale === "es" ? "Carrito  ›  Pago y entrega  ›  Confirmación" : "Cart  ›  Payment and delivery  ›  Confirmation"}</p><h1>{locale === "es" ? "Pago y entrega" : "Payment and delivery"}</h1><p>{locale === "es" ? "Completa tu información para recibir y pagar tu pedido." : "Complete your information to receive and pay for your order."}</p></header><CheckoutView locale={locale}/></div></PublicShell>;
}
