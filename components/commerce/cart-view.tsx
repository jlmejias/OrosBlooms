"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "./store-provider";
import { formatCRC } from "@/lib/format";
import { cartTotal } from "@/lib/store";
import type { Locale } from "@/lib/i18n";

export function CartView({ locale }: { locale: Locale }) {
  const es = locale === "es";
  const { cart, removeItem, updateQuantity, clearCart } = useStore();
  const total = cartTotal(cart);

  if (!cart.length) return <section className="cart-empty">
    <span aria-hidden="true">✦</span>
    <h2>{es ? "Tu carrito está vacío" : "Your cart is empty"}</h2>
    <p>{es ? "Explora la colección y agrega las flores que más te gusten." : "Explore the collection and add the flowers you love."}</p>
    <Link className="commerce-primary" href="/flores">{es ? "Explorar flores" : "Explore flowers"}</Link>
  </section>;

  return <div className="cart-layout">
    <section className="cart-items" aria-label={es ? "Productos en el carrito" : "Cart products"}>
      <div className="cart-items-heading">
        <h2>{es ? "Tu pedido" : "Your order"}</h2>
        <span>{cart.length} {cart.length === 1 ? (es ? "producto" : "item") : (es ? "productos" : "items")}</span>
      </div>
      {cart.map((item, index) => <article className="cart-row" key={`${item.slug}-${item.variantId}-${index}`}>
        <div className="cart-row-image"><Image src={item.image ?? "/home-hero.webp"} alt={item.name} fill sizes="(max-width: 600px) 92px, 120px"/></div>
        <div className="cart-row-copy">
          <p className="cart-row-eyebrow">{es ? "Selección floral" : "Floral selection"}</p>
          <h3>{item.name}</h3>
          {item.personalization && <p className="cart-row-note">{item.personalization}</p>}
          <button className="cart-remove" type="button" onClick={() => removeItem(index)} aria-label={`${es ? "Eliminar" : "Remove"} ${item.name}`}><span aria-hidden="true">×</span>{es ? "Eliminar" : "Remove"}</button>
        </div>
        <div className="cart-quantity">
          <span>{es ? "Cantidad" : "Quantity"}</span>
          <div className="cart-stepper">
            <button type="button" onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))} aria-label={es ? "Disminuir cantidad" : "Decrease quantity"}>−</button>
            <input aria-label={es ? "Cantidad" : "Quantity"} type="number" min="1" value={item.quantity} onChange={event => updateQuantity(index, Math.max(1, Number(event.target.value) || 1))}/>
            <button type="button" onClick={() => updateQuantity(index, item.quantity + 1)} aria-label={es ? "Aumentar cantidad" : "Increase quantity"}>+</button>
          </div>
        </div>
        <strong className="cart-row-price">{formatCRC(item.price * item.quantity)}</strong>
      </article>)}
    </section>
    <aside className="cart-summary">
      <p className="cart-summary-kicker">{es ? "Resumen" : "Summary"}</p>
      <div className="cart-summary-line"><span>{es ? "Subtotal estimado" : "Estimated subtotal"}</span><strong>{formatCRC(total)}</strong></div>
      <p className="cart-summary-note">{es ? "La entrega y el total final se confirman al coordinar tu pedido." : "Delivery and the final total are confirmed when arranging your order."}</p>
      <Link className="commerce-primary" href="/solicitar?tipo=pedido">{es ? "Solicitar este pedido" : "Request this order"}</Link>
      <button className="cart-clear" type="button" onClick={clearCart}>{es ? "Vaciar carrito" : "Clear cart"}</button>
    </aside>
  </div>;
}
