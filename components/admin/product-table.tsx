"use client";

import { InboxOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, Pagination, Select } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { archiveProduct, deleteArchivedProduct } from "@/app/admin/actions";
import { formatCRC } from "@/lib/format";
import { AdminRecordActions } from "./admin-record-actions";

type Product = { id: string; name: string; slug: string; type: string; basePrice: number; status: "draft" | "active" | "archived"; featured: boolean; categoryId: string | null };
type Category = { id: string; name: string };
type ProductImage = { productId: string; url: string };
type ProductVariant = { productId: string };
const perPage = 5;
const statusLabel = { active: "Activo", draft: "Borrador", archived: "Archivado" };

export function ProductTable({ items, categories, images, variants }: { items: Product[]; categories: Category[]; images: ProductImage[]; variants: ProductVariant[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const imageByProduct = useMemo(() => new Map(images.map(item => [item.productId, item.url])), [images]);
  const variantsByProduct = useMemo(() => variants.reduce<Map<string, number>>((result, item) => result.set(item.productId, (result.get(item.productId) ?? 0) + 1), new Map()), [variants]);
  const filtered = useMemo(() => items.filter(item => (!search || `${item.name} ${item.slug}`.toLowerCase().includes(search.toLowerCase())) && (!category || item.categoryId === category) && (!status || item.status === status)), [items, search, category, status]);
  const visible = filtered.slice((page - 1) * perPage, page * perPage);
  const changeFilter = (update: () => void) => { update(); setPage(1); };
  if (!items.length) return <section className="admin-empty-state"><div className="admin-empty-state-icon"><InboxOutlined/></div><h2>Aún no tienes productos</h2><p>Crea tu primer producto para comenzar a organizar el catálogo floral.</p><Link className="admin-button" href="/admin/productos?new=1"><PlusOutlined/> Agregar primer producto</Link></section>;
  return <div className="product-table-workspace">
    <div className="product-table-filters"><Input prefix={<SearchOutlined/>} placeholder="Buscar productos..." value={search} onChange={event => changeFilter(() => setSearch(event.target.value))}/><Select value={category || undefined} placeholder="Todas las categorías" allowClear options={categories.map(item => ({ value: item.id, label: item.name }))} onChange={value => changeFilter(() => setCategory(value ?? ""))}/><Select value={status || undefined} placeholder="Todos los estados" allowClear options={Object.entries(statusLabel).map(([value, label]) => ({ value, label }))} onChange={value => changeFilter(() => setStatus(value ?? ""))}/></div>
    <section className="product-table-card"><table className="admin-table product-table"><thead><tr><th>Producto</th><th>Tipo</th><th>Precio</th><th>Estado</th><th>Inventario</th><th>Acciones</th></tr></thead><tbody>{visible.map(item => { const image = imageByProduct.get(item.id); const count = variantsByProduct.get(item.id) ?? 0; const archived=item.status==="archived"; return <tr key={item.id}><td><div className="admin-product-table-cell"><span className="admin-product-avatar">{image ? <Image src={image} alt="" width={38} height={38} unoptimized/> : item.name.slice(0, 1).toUpperCase()}</span><div><strong>{item.name}</strong>{image && <span className="product-primary-tag">Principal</span>}{item.featured && <span className="product-primary-tag">Destacado</span>}<small>{item.slug}</small></div></div></td><td>{item.type}</td><td>{formatCRC(item.basePrice)}</td><td><span className={`product-table-status is-${item.status}`}>{statusLabel[item.status]}</span></td><td>{count} {count === 1 ? "variante" : "variantes"}</td><td><AdminRecordActions id={item.id} editHref={`/admin/productos?edit=${item.id}`} assetsHref={`/admin/productos?assets=${item.id}`} deleteAction={archived?deleteArchivedProduct:archiveProduct} deleteLabel={archived?"Eliminar":"Archivar"}/></td></tr>; })}</tbody></table><footer><span>Mostrando {filtered.length ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, filtered.length)} de {filtered.length} productos</span><Pagination current={page} pageSize={perPage} total={filtered.length} showSizeChanger={false} onChange={setPage}/></footer></section>
  </div>;
}
