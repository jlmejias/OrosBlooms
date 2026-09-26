import { EmptyState } from "@/components/shared/states";
import { ProductCard } from "@/components/commerce/product-card";
import { PublicShell } from "@/components/commerce/public-shell";
import { listCategories, listProducts } from "@/services/catalog";
import { listCombos } from "@/services/catalog";
import { stringValue } from "@/lib/format";
import { formatCRC } from "@/lib/format";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Flores", description: "Arreglos florales de temporada creados por OrosBlooms en Costa Rica.", alternates: { canonical: "/flores" } };

export default async function FlowersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams; const category = stringValue(params.categoria); const sort = stringValue(params.orden); const query = stringValue(params.q);
  const locale=await getLocale(); const es=locale==="es";
  const [items, categoryItems, combos] = await Promise.all([listProducts({ category, sort, query }), listCategories(), listCombos()]);
  const matchingCombos=category?[]:combos.filter(combo=>!query||`${combo.name} ${combo.description??""}`.toLowerCase().includes(query.toLowerCase()));
  const catalogItems=[...items.map(item=>({kind:"product" as const,item,price:item.basePrice})),...matchingCombos.map(item=>({kind:"combo" as const,item,price:item.promotionalPrice??item.price}))];
  if(sort)catalogItems.sort((first,second)=>sort==="nombre"?first.item.name.localeCompare(second.item.name):sort==="precio-asc"?first.price-second.price:sort==="precio-desc"?second.price-first.price:0);
  return <PublicShell><div className="commerce-wrap"><header className="commerce-hero"><p className="commerce-kicker">{es?"Catálogo floral":"Floral catalog"}</p><h1>{es?"Flores para cada historia.":"Flowers for every story."}</h1><p>{es?"Explora arreglos elaborados con flores de temporada.":"Explore arrangements made with seasonal flowers."}</p></header><div className="catalog-layout"><form className="catalog-filters"><label>{es?"Buscar":"Search"}<input name="q" defaultValue={query} placeholder={es?"Rosas, cumpleaños...":"Roses, birthdays..."}/></label><label>{es?"Categoría":"Category"}<select name="categoria" defaultValue={category}><option value="">{es?"Todas":"All"}</option>{categoryItems.filter(item=>!["complementos","personalizados"].includes(item.slug)).map(item=><option key={item.id} value={item.slug}>{item.name}</option>)}</select></label><label>{es?"Orden":"Sort"}<select name="orden" defaultValue={sort}><option value="">{es?"Destacados":"Featured"}</option><option value="precio-asc">{es?"Precio menor":"Lowest price"}</option><option value="precio-desc">{es?"Precio mayor":"Highest price"}</option><option value="nombre">{es?"Nombre":"Name"}</option></select></label><button type="submit">{es?"Aplicar filtros":"Apply filters"}</button></form><div><div className="catalog-toolbar"><span>{catalogItems.length} {es?"diseños":"designs"}</span><Link href="/flores">{es?"Limpiar filtros":"Clear filters"}</Link></div>{catalogItems.length?<div className="catalog-grid">{catalogItems.map(entry=>entry.kind==="product"?<ProductCard key={entry.item.id} product={entry.item} locale={locale}/>:<article className="catalog-card" key={entry.item.id}><div className="catalog-card-image"><Link href="/combos"><Image src={entry.item.imageUrl??"/home-hero.webp"} alt={entry.item.name} fill sizes="(max-width: 640px) 50vw, 25vw"/></Link></div><div className="catalog-card-info"><p>{es?"Combo":"Gift set"}</p><h2><Link href="/combos">{entry.item.name}</Link></h2><span>{entry.item.promotionalPrice&&<del>{formatCRC(entry.item.price)} </del>}{formatCRC(entry.price)}</span></div></article>)}</div>:<EmptyState title={es?"No encontramos diseños":"No designs found"} description={es?"Prueba otra categoría o término de búsqueda.":"Try another category or search term."} action={<Link href="/flores">{es?"Ver todas las flores":"View all flowers"}</Link>}/>}</div></div></div></PublicShell>;
}

