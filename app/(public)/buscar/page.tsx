import Link from "next/link";
import { PublicShell } from "@/components/commerce/public-shell";
import { searchSite } from "@/services/catalog";
import { stringValue } from "@/lib/format";
import { getLocale } from "@/lib/i18n";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [p, locale] = await Promise.all([searchParams, getLocale()]);
  const es = locale === "es";
  const q = stringValue(p.q);
  const results = await searchSite(q);
  const empty = <p>{es ? "Sin resultados." : "No results."}</p>;
  return <PublicShell><div className="commerce-wrap"><header className="commerce-hero"><p className="commerce-kicker">{es ? "Búsqueda" : "Search"}</p><h1>{es ? "Encuentra tu momento." : "Find your moment."}</h1><form className="search-form"><input name="q" defaultValue={q} placeholder={es ? "Flores, ocasiones o servicios" : "Flowers, occasions, or services"} autoFocus /><button className="commerce-primary">{es ? "Buscar" : "Search"}</button></form></header>{q && <div className="search-results"><section><h2>{es ? "Flores" : "Flowers"}</h2><div className="result-list">{results.products.map(item => <Link key={item.slug} href={`/flores/${item.slug}`}>{item.name}</Link>)}{!results.products.length && empty}</div></section><section><h2>{es ? "Categorías" : "Categories"}</h2><div className="result-list">{results.categories.map(item => <Link key={item.slug} href={`/flores?categoria=${item.slug}`}>{item.name}</Link>)}{!results.categories.length && empty}</div></section><section><h2>{es ? "Servicios" : "Services"}</h2><div className="result-list">{results.services.map(item => <Link key={item.slug} href={item.slug === "bodas" ? "/bodas" : "/eventos"}>{item.name}</Link>)}{!results.services.length && empty}</div></section></div>}</div></PublicShell>;
}
