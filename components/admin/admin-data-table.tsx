"use client";

import { InboxOutlined, PlusOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";
import { Input, Pagination, Select } from "antd";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminRecordActions } from "./admin-record-actions";

type Cell = string | number | {
  primary: string;
  secondary?: string;
  tone?: "active" | "inactive" | "warning";
};

export type AdminDataRow = {
  id: string;
  cells: Cell[];
  searchText?: string;
  filterValue?: string;
  editHref?: string;
  deleteValues?: Record<string, string>;
  canDelete?: boolean;
};

type Props = {
  columns: string[];
  rows: AdminDataRow[];
  noun: string;
  searchPlaceholder: string;
  filterPlaceholder?: string;
  filterOptions?: Array<{ value: string; label: string }>;
  deleteAction?: (data: FormData) => Promise<void>;
  deleteLabel?: string;
};

const perPage = 5;

const emptyStates: Record<string, { title: string; text: string; href?: string; action?: string; clients?: boolean }> = {
  clientes: { title: "Aún no tienes clientes", text: "Los clientes aparecerán aquí cuando hagan una solicitud, un pedido o los agregues manualmente.", href: "/admin/clientes?new=1", action: "Agregar primer cliente", clients: true },
  combos: { title: "Aún no tienes combos", text: "Crea un combo para agrupar productos y ofrecerlos como una selección especial.", href: "/admin/combos?new=1", action: "Agregar primer combo" },
  publicaciones: { title: "Aún no tienes publicaciones", text: "Agrega una publicación para comenzar a mostrar tus trabajos en la galería.", href: "/admin/galeria?new=1", action: "Agregar primera publicación" },
  solicitudes: { title: "Aún no hay solicitudes", text: "Las nuevas solicitudes de tus clientes aparecerán aquí." },
  secciones: { title: "Aún no hay secciones", text: "Las secciones configurables de la portada aparecerán aquí." },
};

export function AdminDataTable({ columns, rows, noun, searchPlaceholder, filterPlaceholder = "Todos", filterOptions = [], deleteAction, deleteLabel }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => rows.filter(row => {
    const text = row.searchText ?? row.cells.map(cell => typeof cell === "object" ? `${cell.primary} ${cell.secondary ?? ""}` : String(cell)).join(" ");
    return (!search || text.toLowerCase().includes(search.toLowerCase())) && (!filter || row.filterValue === filter);
  }), [filter, rows, search]);
  const visible = filtered.slice((page - 1) * perPage, page * perPage);
  const changeFilter = (update: () => void) => { update(); setPage(1); };

  if (!rows.length) {
    const empty = emptyStates[noun] ?? { title: `Aún no hay ${noun}`, text: `Los ${noun} aparecerán aquí cuando estén disponibles.` };
    return <section className="admin-empty-state"><div className="admin-empty-state-icon">{empty.clients ? <TeamOutlined/> : <InboxOutlined/>}</div><h2>{empty.title}</h2><p>{empty.text}</p>{empty.href && <Link className="admin-button" href={empty.href}><PlusOutlined/> {empty.action}</Link>}</section>;
  }
  return <div className="product-table-workspace admin-data-table-workspace">
    <div className={`product-table-filters admin-list-filters ${filterOptions.length ? "" : "has-search-only"}`.trim()}>
      <Input prefix={<SearchOutlined/>} placeholder={searchPlaceholder} value={search} allowClear onChange={event => changeFilter(() => setSearch(event.target.value))}/>
      {filterOptions.length > 0 && <Select value={filter || undefined} placeholder={filterPlaceholder} allowClear options={filterOptions} onChange={value => changeFilter(() => setFilter(value ?? ""))}/>} 
    </div>
    <section className="product-table-card"><table className="admin-table product-table admin-data-table"><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{visible.map(row => <tr key={row.id}>{row.cells.map((cell, index) => <td key={`${row.id}-${columns[index] ?? index}`}>{typeof cell === "object" ? cell.tone ? <span className={`product-table-status ${cell.tone === "inactive" ? "is-archived" : cell.tone === "warning" ? "is-draft" : "is-active"}`}>{cell.primary}</span> : <div className="service-table-name"><strong>{cell.primary}</strong>{cell.secondary && <small>{cell.secondary}</small>}</div> : cell}</td>)}<td><AdminRecordActions id={row.id} editHref={row.editHref} deleteAction={row.canDelete === false ? undefined : deleteAction} deleteLabel={deleteLabel} deleteValues={row.deleteValues}/></td></tr>)}</tbody></table><footer><span>Mostrando {filtered.length ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, filtered.length)} de {filtered.length} {noun}</span><Pagination current={page} pageSize={perPage} total={filtered.length} showSizeChanger={false} onChange={setPage}/></footer></section>
  </div>;
}
