"use client";

import { useState } from "react";
import { useStore, type StoreItem } from "./store-provider";
import { formatCRC } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export function FavoriteButton({ slug, locale="en" }: { slug: string; locale?:Locale }) {
  const { favorites, toggleFavorite } = useStore();
  const active = favorites.includes(slug);
  return <button type="button" className={`store-heart${active ? " is-active" : ""}`} onClick={() => toggleFavorite(slug)} aria-label={active ? (locale==="es"?"Quitar de favoritos":"Remove from favorites") : (locale==="es"?"Agregar a favoritos":"Add to favorites")}>{active ? "♥" : "♡"}</button>;
}

type Complement = { id: string; slug: string; name: string; basePrice: number; image?: string | null };

export function ProductPurchase({ product, variants, complements = [] }: { product: Omit<StoreItem, "quantity" | "variantId">; variants: { id: string; name: string; price: number }[]; complements?: Complement[] }) {
  const { addItem } = useStore();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [personalization, setPersonalization] = useState("");
  const [selectedComplements, setSelectedComplements] = useState<string[]>([]);
  const selected = variants.find(item => item.id === variantId);
  const total = (selected?.price ?? product.price) + complements.filter(item => selectedComplements.includes(item.id)).reduce((sum, item) => sum + item.basePrice, 0);
  const addSelection = () => {
    addItem({ ...product, variantId: selected?.id, price: selected?.price ?? product.price, quantity: 1, personalization });
    complements.filter(item => selectedComplements.includes(item.id)).forEach(item => addItem({ productId: item.id, slug: item.slug, name: item.name, price: item.basePrice, image: item.image, quantity: 1 }));
  };
  return <div className="purchase-box">
    {variants.length > 0 && <label>Tamaño o presentación<select value={variantId} onChange={event => setVariantId(event.target.value)}>{variants.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
    {complements.length > 0 && <fieldset className="complement-options"><legend>Complementos recomendados</legend>{complements.map(item => <label key={item.id}><input type="checkbox" checked={selectedComplements.includes(item.id)} onChange={() => setSelectedComplements(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id])}/><span>{item.name}</span><strong>{formatCRC(item.basePrice)}</strong></label>)}</fieldset>}
    <label>Dedicatoria o indicaciones<textarea value={personalization} onChange={event => setPersonalization(event.target.value)} placeholder="Opcional" maxLength={400} /></label>
    <p className="purchase-total">Total estimado <strong>{formatCRC(total)}</strong></p>
    <button className="commerce-primary" type="button" onClick={addSelection}>Agregar selección al carrito</button>
  </div>;
}
