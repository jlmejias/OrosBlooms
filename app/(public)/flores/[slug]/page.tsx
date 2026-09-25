import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/commerce/public-shell";
import { FavoriteButton, ProductPurchase } from "@/components/commerce/store-actions";
import { getProduct } from "@/services/catalog";
import { formatCRC } from "@/lib/format";
import { absoluteUrl, jsonLd } from "@/lib/site";
import { getLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const product = await getProduct(slug);
  if (!product) return { title: "Diseño no encontrado", robots: { index: false, follow: false } };
  return { title: product.name, description: product.shortDescription ?? product.description, alternates: { canonical: `/flores/${slug}` }, openGraph: { type: "website", title: product.name, description: product.shortDescription ?? undefined, images: product.image ? [product.image] : [] } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const [product,locale] = await Promise.all([getProduct(slug),getLocale()]); if (!product) notFound(); const es=locale==="es";
  const productJsonLd = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description ?? product.shortDescription, image: absoluteUrl(product.image ?? "/home-hero.webp"), offers: { "@type": "Offer", priceCurrency: "CRC", price: product.basePrice, availability: "https://schema.org/InStock", url: absoluteUrl(`/flores/${product.slug}`) } };
  return <PublicShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd) }} /><div className="commerce-wrap detail-grid"><div className="detail-image"><Image src={product.image ?? "/home-hero.webp"} alt={product.imageAlt ?? product.name} fill priority sizes="(max-width:900px) 100vw,55vw" /><FavoriteButton slug={product.slug} locale={locale} /></div><div className="detail-copy"><p className="commerce-kicker">{product.category ?? (es?"Diseño floral":"Floral design")}</p><h1>{product.name}</h1><span className="detail-price">{product.priceLabel ? `${product.priceLabel} ` : ""}{formatCRC(product.basePrice)}</span><p>{product.description ?? product.shortDescription ?? (es?"Diseñado cuidadosamente con flores seleccionadas según temporada.":"Carefully designed with flowers selected for the season.")}</p><p>{es?"Las flores y tonos pueden variar según disponibilidad, conservando siempre el estilo y valor del arreglo.":"Flowers and tones may vary based on availability while preserving the arrangement's style and value."}</p><ProductPurchase product={{ kind: "product", productId: product.id, slug: product.slug, name: product.name, price: product.basePrice, image: product.image }} variants={product.variants} complements={product.complements} locale={locale} /></div></div></PublicShell>;
}
