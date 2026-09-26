"use client";

import { useState } from "react";
import { Button, Modal } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore, type StoreItem } from "./store-provider";
import { formatCRC } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export function FavoriteButton({ slug, locale="en" }: { slug: string; locale?:Locale }) {
  const { favorites, toggleFavorite } = useStore();
  const active = favorites.includes(slug);
  return <button type="button" className={`store-heart${active ? " is-active" : ""}`} onClick={() => toggleFavorite(slug)} aria-label={active ? (locale==="es"?"Quitar de favoritos":"Remove from favorites") : (locale==="es"?"Agregar a favoritos":"Add to favorites")}>{active ? "♥" : "♡"}</button>;
}

type Complement = { id: string; slug: string; name: string; basePrice: number; image?: string | null };

export function ProductPurchase({ product, variants, complements = [], locale = "es" }: { product: Omit<Extract<StoreItem, { kind: "product" }>, "quantity" | "variantId">; variants: { id: string; name: string; price: number }[]; complements?: Complement[]; locale?: Locale }) {
  const { addItem } = useStore();
  const router = useRouter();
  const es = locale === "es";
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [personalization, setPersonalization] = useState("");
  const [selectedComplements, setSelectedComplements] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const selected = variants.find(item => item.id === variantId);
  const total = (selected?.price ?? product.price) + complements.filter(item => selectedComplements.includes(item.id)).reduce((sum, item) => sum + item.basePrice, 0);
  const addSelection = () => {
    addItem({ ...product, variantId: selected?.id, price: selected?.price ?? product.price, quantity: 1, personalization });
    complements.filter(item => selectedComplements.includes(item.id)).forEach(item => addItem({ kind: "product", productId: item.id, slug: item.slug, name: item.name, price: item.basePrice, image: item.image, quantity: 1 }));
    setAdded(true);
  };
  return <div className="purchase-box">
    {variants.length > 0 && <label>{es?"Tamaño o presentación":"Size or presentation"}<select value={variantId} onChange={event => setVariantId(event.target.value)}>{variants.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
    {complements.length > 0 && <fieldset className="complement-options"><legend>{es?"Complementos recomendados":"Recommended extras"}</legend>{complements.map(item => <label className="complement-option" key={item.id}><input type="checkbox" checked={selectedComplements.includes(item.id)} onChange={() => setSelectedComplements(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id])}/><span className="complement-option-image">{item.image?<Image src={item.image} alt={item.name} fill sizes="64px"/>:<span aria-hidden="true">✦</span>}</span><span className="complement-option-copy"><strong>{item.name}</strong><small>{es?"Complemento para tu arreglo":"Extra for your arrangement"}</small></span><strong className="complement-option-price">{formatCRC(item.basePrice)}</strong></label>)}</fieldset>}
    <label>{es?"Dedicatoria o indicaciones":"Message or instructions"}<textarea value={personalization} onChange={event => setPersonalization(event.target.value)} placeholder={es?"Opcional":"Optional"} maxLength={400} /></label>
    <p className="purchase-total">{es?"Total estimado":"Estimated total"} <strong>{formatCRC(total)}</strong></p>
    <button className="commerce-primary" type="button" onClick={addSelection}>{es?"Agregar selección al carrito":"Add selection to cart"}</button><Modal className="cart-added-modal" title={<div className="cart-added-title"><span>✓</span><div>{es?"Agregado al carrito":"Added to cart"}<small>{es?"Tu selección está lista para continuar.":"Your selection is ready."}</small></div></div>} open={added} onCancel={() => setAdded(false)} centered width={460} footer={<><Button className="cart-added-continue" onClick={() => router.push("/flores")}>{es?"Seguir comprando":"Continue shopping"}</Button><Button className="cart-added-go" type="primary" onClick={() => router.push("/carrito")}>{es?"Ir al carrito":"Go to cart"}</Button></>}><p className="cart-added-copy">{es?"Tu selección se agregó correctamente al carrito.":"Your selection was added to the cart."}</p></Modal>
  </div>;
}
