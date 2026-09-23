import { EmptyState } from "@/components/shared/states";
import { ProductCard } from "@/components/commerce/product-card";
import { PublicShell } from "@/components/commerce/public-shell";
import { listCategories, listProducts } from "@/services/catalog";
import { stringValue } from "@/lib/format";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Flores", description: "Arreglos florales de temporada creados por OrosBlooms en Costa Rica.", alternates: { canonical: "/flores" } };

export default async function FlowersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams; const category = stringValue(params.categoria); const sort = stringValue(params.orden); const query = stringValue(params.q);
  const es=(await getLocale())==="es";
  const [items, categoryItems] = await Promise.all([listProducts({ category, sort, query }), listCategories()]);
  return <PublicShell><div className="commerce-wrap"><header className="commerce-hero"><p className="commerce-kicker">{es?"Catálogo floral":"Floral catalog"}</p><h1>{es?"Flores para cada historia.":"Flowers for every story."}</h1><p>{es?"Explora arreglos elaborados con flores de temporada.":"Explore arrangements made with seasonal flowers."}</p></header><div className="catalog-layout"><form className="catalog-filters"><label>{es?"Buscar":"Search"}<input name="q" defaultValue={query} placeholder={es?"Rosas, cumpleaños...":"Roses, birthdays..."}/></label><label>{es?"Categoría":"Category"}<select name="categoria" defaultValue={category}><option value="">{es?"Todas":"All"}</option>{categoryItems.filter(item=>!["complementos","personalizados"].includes(item.slug)).map(item=><option key={item.id} value={item.slug}>{item.name}</option>)}</select></label><label>{es?"Orden":"Sort"}<select name="orden" defaultValue={sort}><option value="">{es?"Destacados":"Featured"}</option><option value="precio-asc">{es?"Precio menor":"Lowest price"}</option><option value="precio-desc">{es?"Precio mayor":"Highest price"}</option><option value="nombre">{es?"Nombre":"Name"}</option></select></label><button type="submit">{es?"Aplicar filtros":"Apply filters"}</button></form><div><div className="catalog-toolbar"><span>{items.length} {es?"diseños":"designs"}</span><Link href="/flores">{es?"Limpiar filtros":"Clear filters"}</Link></div>{items.length?<div className="catalog-grid">{items.map(product=><ProductCard key={product.id} product={product}/>)}</div>:<EmptyState title={es?"No encontramos diseños":"No designs found"} description={es?"Prueba otra categoría o término de búsqueda.":"Try another category or search term."} action={<Link href="/flores">{es?"Ver todas las flores":"View all flowers"}</Link>}/>}</div></div></div></PublicShell>;
}

