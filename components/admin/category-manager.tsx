"use client";

import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Pagination, Select } from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { archiveCategory } from "@/app/admin/actions";
import { AdminRecordActions } from "./admin-record-actions";
import { CategoryForm } from "./category-form";
import { DraggableModal } from "./draggable-modal";

type Category = { id: string; name: string; slug: string; description: string | null; sortOrder: number; visible: boolean };
const perPage = 5;

export function CategoryManager({ items }: { items: Category[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | undefined>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const usedOrders = new Set(items.map(item => item.sortOrder));
  const suggestedSortOrder = items.reduce((next) => { while (usedOrders.has(next)) next += 1; return next; }, 0);
  const filtered = useMemo(() => items.filter(item => (!search || `${item.name} ${item.slug}`.toLowerCase().includes(search.toLowerCase())) && (!status || (status === "visible" ? item.visible : !item.visible))), [items, search, status]);
  const visible = filtered.slice((page - 1) * perPage, page * perPage);
  const changeFilter = (update: () => void) => { update(); setPage(1); };
  const startCreate = () => { setEditing(undefined); setOpen(true); };
  const startEdit = (item: Category) => { setEditing(item); setOpen(true); };
  const close = () => setOpen(false);
  return <><div className="admin-grid">
    <div className="admin-modal-form-slot"><Button className="admin-modal-trigger" type="primary" icon={<PlusOutlined/>} onClick={startCreate}>Nueva categoría</Button></div>
    <div className="product-table-workspace category-table-workspace">
      <div className="product-table-filters admin-list-filters"><Input prefix={<SearchOutlined/>} placeholder="Buscar categorías..." value={search} onChange={event => changeFilter(() => setSearch(event.target.value))}/><Select value={status || undefined} placeholder="Todos los estados" allowClear options={[{value:"visible",label:"Visible"},{value:"hidden",label:"Oculta"}]} onChange={value => changeFilter(() => setStatus(value ?? ""))}/></div>
      <section className="product-table-card"><table className="admin-table product-table category-table"><thead><tr><th>Categoría</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{visible.map(item=><tr key={item.id}><td><div className="service-table-name"><strong>{item.name}</strong><small>{item.slug}</small></div></td><td>{item.sortOrder}</td><td><span className={`product-table-status ${item.visible?"is-active":"is-archived"}`}>{item.visible?"Visible":"Oculta"}</span></td><td><div className="service-table-actions"><Button type="text" shape="circle" icon={<EditOutlined/>} aria-label="Editar" onClick={() => startEdit(item)}/><AdminRecordActions id={item.id} deleteAction={archiveCategory} deleteLabel="Ocultar"/></div></td></tr>)}</tbody></table><footer><span>Mostrando {filtered.length?(page-1)*perPage+1:0}–{Math.min(page*perPage,filtered.length)} de {filtered.length} categorías</span><Pagination current={page} pageSize={perPage} total={filtered.length} showSizeChanger={false} onChange={setPage}/></footer></section>
    </div>
    </div>
    <Modal className="admin-standard-modal" title={<div className="admin-modal-title"><strong>{editing ? "Editar categoría" : "Nueva categoría"}</strong><span>Define la información, el orden y la visibilidad de la categoría.</span></div>} open={open} onCancel={close} footer={null} destroyOnHidden width={720} centered modalRender={modal => <DraggableModal>{modal}</DraggableModal>}><CategoryForm key={editing?.id ?? "new"} editing={editing} suggestedSortOrder={suggestedSortOrder} onSuccess={() => { close(); router.refresh(); }}/></Modal>
  </>;
}
