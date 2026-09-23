import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/services/catalog";
import { formatCRC } from "@/lib/format";
import { FavoriteButton } from "./store-actions";
import type { Locale } from "@/lib/i18n";

export function ProductCard({ product, locale="en" }: { product: CatalogProduct; locale?:Locale }) {
  return <article className="catalog-card"><div className="catalog-card-image"><Link href={`/flores/${product.slug}`}><Image src={product.image ?? "/home-hero.webp"} alt={product.imageAlt ?? product.name} fill sizes="(max-width: 640px) 50vw, 25vw" /></Link><FavoriteButton slug={product.slug} locale={locale} /></div><div className="catalog-card-info"><p>{product.category ?? (locale==="es"?"Arreglo floral":"Floral arrangement")}</p><h2><Link href={`/flores/${product.slug}`}>{product.name}</Link></h2><span>{product.priceLabel ? `${product.priceLabel} ` : ""}{formatCRC(product.basePrice)}</span></div></article>;
}
